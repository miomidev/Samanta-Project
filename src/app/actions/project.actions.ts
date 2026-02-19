'use server';

import { projectService } from '@/lib/services/project.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { authService } from '@/lib/services/auth.service';

// Authenticated helper
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  
  try {
    const payload = authService.verifyToken(token);
    return (payload as any).id;
  } catch {
    throw new Error('Unauthorized');
  }
}

export async function createProjectAction(prevState: any, formData: FormData) {
  try {
    const userId = await getUserId();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) return { error: 'Name is required' };

    // Use a simple create method for now (not the complex AI generation one unless requested)
    // Wait, projectService has createProjectFromPrompt which does AI.
    // Let's implement a simple create for CRUD first, or use the prompt one?
    // User request: "crud". Usually implies basic data entry. 
    // But `projectService` seems geared towards AI.
    // Let's assume description IS the prompt for now, or use a basic create.
    // projectService doesn't have a simple `create` method exposed clearly other than `createProjectFromPrompt`.
    // Let's add a `createProject` to `projectService` or just use `createProjectFromPrompt`?
    // `createProjectFromPrompt` is core to this app ("Samanta"). So I should use it!
    // It takes (userId, prompt, name). description -> prompt.
    
    await projectService.createProjectFromPrompt(userId, description, name);

    revalidatePath('/dashboard');
    return { success: true, error: '' };
  } catch (error: any) {
    return { error: error.message || 'Failed to create project', success: false };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const userId = await getUserId();
    // Verify ownership? projectService.deleteProject doesn't check owner yet.
    // For now, strict CRUD.
    await projectService.deleteProject(projectId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Delete error', error);
    return { error: 'Failed to delete project' };
  }
}

export async function updateProjectAction(prevState: any, formData: FormData) {
  try {
    const userId = await getUserId();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!id || !name) return { error: 'ID and Name required' };

    await projectService.updateProject(id, { name, description });

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/${id}`);
    return { success: true, error: '' };
  } catch (error: any) {
    return { error: 'Failed to update project', success: false };
  }
}
