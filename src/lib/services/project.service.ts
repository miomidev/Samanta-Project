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

    // 1. Generate Spec
    try {
      openSpec = await apiService.generateOpenSpec(prompt, { databaseType });

      // Auto-correct project name
      if (openSpec.project) {
        openSpec.project.name = projectName;
      }
    } catch (error) {
      console.error('Failed to generate spec:', error);
      // Fallback spec is already handled in apiService, but double check
      openSpec = {
        version: 'v1',
        project: { name: projectName, description: prompt, namespace: 'generated' },
        database: { connection: 'mysql', databaseName: 'app_db', tables: [] }, // Default fallback
        models: [], controllers: [], routes: []
      };
    }

    const processingTime = Date.now() - startTime;

    // 2. Create Project
    let project: ProjectModel;
    try {
      project = await ProjectModel.create({
        name: projectName,
        description: prompt,
        status: 'draft',
        openSpec: openSpec,
        userId: userId,
      } as any);
    } catch (dbError) {
      console.error('Error creating project record:', dbError);
      throw dbError;
    }

    // 3. Save Prompt History
    try {
      await this.savePromptHistory({
        userId,
        projectId: project.id,
        prompt: prompt,
        response: openSpec,
        status: 'processed',
        tokensUsed: 0,
        processingTime: processingTime
      });
    } catch (historyError) {
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
