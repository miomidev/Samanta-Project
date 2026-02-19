import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenSpec } from '@/lib/types';

export class ApiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generates an OpenSpec JSON object from a text prompt using Gemini AI.
   * @param prompt User's description of the project
   * @returns OpenSpec object
   */
  async generateOpenSpec(prompt: string): Promise<OpenSpec> {
    try {
      const systemPrompt = `
        You are an expert software architect. converting user descriptions into a structured project specification (OpenSpec).
        
        The OpenSpec structure must follow this interface exactly:
        
        interface OpenSpec {
          version: 'v1';
          project: {
            name: string;
            description: string;
            namespace: string;
          };
          database: {
            connection: 'mysql' | 'pgsql' | 'sqlite';
            databaseName: string;
            tables: Array<{
              name: string;
              columns: Array<{
                name: string;
                type: string; // e.g., 'string', 'integer', 'boolean', 'text', 'datetime'
                nullable?: boolean;
                primary?: boolean;
                unique?: boolean;
              }>;
              foreignKeys?: Array<{
                column: string;
                references: string;
                on: string;
              }>;
            }>;
          };
          models: Array<{
            name: string;
            fillable: string[];
            relationships: Array<{
              type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';
              related: string;
              name: string;
            }>;
          }>;
          controllers: Array<{
            name: string;
            methods: Array<{
              name: string; // e.g., 'index', 'show', 'store'
              httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
              route: string;
            }>;
          }>;
          routes: Array<{
            method: 'GET' | 'POST' | 'PUT' | 'DELETE';
            uri: string;
            controller: string;
            action: string;
          }>;
        }

        Please generate a valid JSON object matching this structure based on the user's prompt. 
        Do not include any markdown formatting (like \`\`\`json), just the raw JSON string.
        Ensure the JSON is valid and parsable.
      `;

      const result = await this.model.generateContent([
        systemPrompt,
        `User Prompt: ${prompt}`
      ]);

      const response = result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const openSpec = JSON.parse(text) as OpenSpec;
      return openSpec;
    } catch (error) {
      console.error('Error generating OpenSpec (using fallback):', error);
      
      // Fallback OpenSpec to allow project creation to proceed
      return {
        version: 'v1',
        project: {
          name: 'Generated Project',
          description: prompt,
          namespace: 'generated'
        },
        database: {
          connection: 'mysql',
          databaseName: 'app_db',
          tables: []
        },
        models: [],
        controllers: [],
        routes: []
      };
    }
  }
}

export const apiService = new ApiService();
