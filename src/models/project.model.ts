// models/project.model.ts
import { DataTypes, Sequelize } from 'sequelize'
import { OpenSpec, Project, ProjectStatus } from '../lib/types'
import { BaseModel } from './base.model'

export class ProjectModel extends BaseModel<Project> implements Project {
  public name!: string
  public description?: string
  public status!: ProjectStatus
  public openSpec!: OpenSpec
  public generatedCode?: string
  public previewUrl?: string
  public repositoryUrl?: string
  public userId!: string

  static associate(models: any) {
    ProjectModel.belongsTo(models.UserModel, {
      foreignKey: 'userId',
      as: 'user'
    })
    ProjectModel.hasMany(models.PromptHistoryModel, {
      foreignKey: 'projectId',
      as: 'prompts'
    })
    ProjectModel.belongsToMany(models.UserModel, {
      through: models.ProjectCollaboratorModel,
      foreignKey: 'projectId',
      otherKey: 'userId',
      as: 'collaborators'
    })
  }

  static initModel(sequelize: Sequelize) {
    return ProjectModel.init(
      {
        ...BaseModel.initAttributes,
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [3, 255]
          }
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('draft', 'processing', 'completed', 'failed'),
          defaultValue: 'draft',
          allowNull: false
        },
        openSpec: {
          type: DataTypes.JSON,
          allowNull: false,
          field: 'open_spec',
          validate: {
            isValidOpenSpec(value: any) {
              // Validasi struktur OpenSpec
              if (!value.project || !value.database) {
                throw new Error('Invalid OpenSpec format')
              }
            }
          }
        },
        generatedCode: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
          field: 'generated_code'
        },
        previewUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'preview_url',
          validate: {
            isUrl: true
          }
        },
        repositoryUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'repository_url',
          validate: {
            isUrl: true
          }
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id'
          }
        }
      },
      {
        sequelize,
        ...BaseModel.initOptions('Project'),
        indexes: [
          {
            fields: ['user_id']
          },
          {
            fields: ['status']
          },
          {
            fields: ['created_at']
          },
          {
            name: 'project_search_idx',
            fields: ['name', 'description']
          }
        ]
      }
    )
  }
}

// Mongoose Model
import mongoose, { Schema } from 'mongoose'
import { IBaseDocument, baseSchema } from './base.model'

export interface IProjectDocument extends IBaseDocument, Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {}

const projectMongooseSchema = new Schema<IProjectDocument>({
  ...baseSchema,
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'failed'],
    default: 'draft',
    required: true
  },
  openSpec: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: (v: any) => v && v.project && v.database,
      message: 'Invalid OpenSpec format'
    }
  },
  generatedCode: {
    type: String,
    required: false
  },
  previewUrl: {
    type: String,
    required: false,
    validate: {
      validator: (v: string) => !v || /^https?:\/\//.test(v),
      message: 'Invalid URL format'
    }
  },
  repositoryUrl: {
    type: String,
    required: false
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Indexes
projectMongooseSchema.index({ userId: 1 })
projectMongooseSchema.index({ status: 1 })
projectMongooseSchema.index({ createdAt: -1 })
projectMongooseSchema.index({ name: 'text', description: 'text' })

export const ProjectMongooseModel = mongoose.model<IProjectDocument>('Project', projectMongooseSchema)