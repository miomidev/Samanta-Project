// models/project-collaborator.model.ts
import { DataTypes, Sequelize } from 'sequelize'
import { CollaboratorRole, ProjectCollaborator } from '../lib/types'
import { BaseModel } from './base.model'

export class ProjectCollaboratorModel extends BaseModel<ProjectCollaborator> implements ProjectCollaborator {
  public projectId!: string
  public userId!: string
  public role!: CollaboratorRole
  public joinedAt!: Date

  static associate(models: any) {
    ProjectCollaboratorModel.belongsTo(models.ProjectModel, {
      foreignKey: 'projectId',
      as: 'project'
    })
    ProjectCollaboratorModel.belongsTo(models.UserModel, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  static initModel(sequelize: Sequelize) {
    return ProjectCollaboratorModel.init(
      {
        projectId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'project_id',
          primaryKey: true,
          references: {
            model: 'projects',
            key: 'id'
          }
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          primaryKey: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        role: {
          type: DataTypes.ENUM('owner', 'editor', 'viewer'),
          defaultValue: 'viewer',
          allowNull: false
        },
        joinedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'joined_at'
        }
      },
      {
        sequelize,
        ...BaseModel.initOptions('ProjectCollaborator'),
        timestamps: false,
        indexes: [
          {
            fields: ['role']
          },
          {
            fields: ['joined_at']
          }
        ]
      }
    )
  }
}

// Mongoose Model
import mongoose, { Schema } from 'mongoose'
import { IBaseDocument } from './base.model'

export interface IProjectCollaboratorDocument extends IBaseDocument, Omit<ProjectCollaborator, 'id' | 'createdAt' | 'updatedAt'> {}

const projectCollaboratorMongooseSchema = new Schema<IProjectCollaboratorDocument>({
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'viewer',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
})

// Composite primary key
projectCollaboratorMongooseSchema.index({ projectId: 1, userId: 1 }, { unique: true })
projectCollaboratorMongooseSchema.index({ role: 1 })
projectCollaboratorMongooseSchema.index({ joinedAt: -1 })

export const ProjectCollaboratorMongooseModel = mongoose.model<IProjectCollaboratorDocument>(
  'ProjectCollaborator', 
  projectCollaboratorMongooseSchema
)