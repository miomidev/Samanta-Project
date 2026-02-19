import '@/lib/db'; // Ensure DB is initialized
import { ProjectModel } from '@/models/project.model';
import { PromptHistoryModel } from '@/models/prompt-history.model';
import { Project, PromptHistory, OpenSpec, ProjectStatus } from '@/lib/types';
import { apiService } from './api.service';

export class ProjectService {
  /**
   * Create a new project mechanism:
   * 1. Generate OpenSpec from prompt using ApiService
   * 2. Save the prompt history
   * 3. Create the Project record with the generated OpenSpec
   */
  async createProjectFromPrompt(userId: string, prompt: string, projectName: string, databaseType: string = 'mysql'): Promise<ProjectModel> {
    const startTime = Date.now();
    let openSpec: OpenSpec;
    let status: ProjectStatus = 'draft';
    
    try {
      // 1. Generate Spec
      openSpec = await apiService.generateOpenSpec(prompt, { databaseType });
      
      // Auto-correct project name in spec if needed or use the one provided
      if (openSpec.project) {
        openSpec.project.name = projectName;
      }

      status = 'draft'; // Success generation, but project is in draft
    } catch (error) {
      console.error('Failed to generate spec:', error);
      throw error;
    }

    const processingTime = Date.now() - startTime;

    // 2. Create Project
    let project: ProjectModel;
    try {
      project = await ProjectModel.create({
        name: projectName,
        description: prompt, // Use prompt as initial description
        status: status,
        openSpec: openSpec,
        userId: userId,
      } as any);
    } catch (dbError) {
      console.error('Error creating project record:', dbError);
      throw dbError;
    }

    // 3. Save Prompt History
    // The user explicitly requested a service to store log history prompt.
    // We do it here as part of the flow.
    try {
      await this.savePromptHistory({
        userId,
        projectId: project.id,
        prompt: prompt,
        response: openSpec,
        status: 'processed',
        tokensUsed: 0, // Gemini API generic response doesn't always give tokens easily without full response obj
        processingTime: processingTime
      });
    } catch (historyError) {
      // Don't fail the whole request if history logging fails
      console.error('Failed to save prompt history:', historyError);
    }

    return project;
  }

  /**
   * Save a record of the prompt and AI response
   */
  async savePromptHistory(data: Partial<PromptHistory>): Promise<PromptHistoryModel> {
    return await PromptHistoryModel.create(data as any);
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<ProjectModel[]> {
    return await ProjectModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get a specific project
   */
  async getProject(id: string): Promise<ProjectModel | null> {
    return await ProjectModel.findByPk(id);
  }

  /**
   * Update a project
   */
  async updateProject(id: string, data: Partial<Project>): Promise<[number, ProjectModel[]]> {
    return await ProjectModel.update(data, {
      where: { id },
      returning: true
    });
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<number> {
    return await ProjectModel.destroy({
      where: { id }
    });
  }
}

export const projectService = new ProjectService();
