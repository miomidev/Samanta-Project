import { projectService } from '@/lib/services/project.service';
import EditProjectForm from '../../EditProjectForm';
import { redirect } from 'next/navigation';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage(props: EditProjectPageProps) {
  const params = await props.params;
  const { id } = params;
  const project = await projectService.getProject(id);

  if (!project) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <EditProjectForm 
        project={{
          id: project.id,
          name: project.name,
          description: project.description
        }} 
      />
    </div>
  );
}
