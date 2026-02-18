// models/prompt-history.model.ts
import { DataTypes, Sequelize } from 'sequelize'
import { OpenSpec, PromptHistory, PromptStatus } from '../lib/types'
import { BaseModel } from './base.model'

export class PromptHistoryModel extends BaseModel<PromptHistory> implements PromptHistory {
  public prompt!: string
  public response!: OpenSpec
  public status!: PromptStatus
  public userId!: string
  public projectId?: string
  public tokensUsed?: number
  public processingTime?: number

  static associate(models: any) {
    PromptHistoryModel.belongsTo(models.UserModel, {
      foreignKey: 'userId',
      as: 'user'
    })
    PromptHistoryModel.belongsTo(models.ProjectModel, {
      foreignKey: 'projectId',
      as: 'project'
    })
  }

  static initModel(sequelize: Sequelize) {
    return PromptHistoryModel.init(
      {
        ...BaseModel.initAttributes,
        prompt: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },
        response: {
          type: DataTypes.JSON,
          allowNull: false,
          field: 'response'
        },
        status: {
          type: DataTypes.ENUM('pending', 'processed', 'failed'),
          defaultValue: 'pending',
          allowNull: false
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        projectId: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'project_id',
          references: {
            model: 'projects',
            key: 'id'
          }
        },
        tokensUsed: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'tokens_used',
          validate: {
            min: 0
          }
        },
        processingTime: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'processing_time',
          comment: 'Processing time in milliseconds',
          validate: {
            min: 0
          }
        }
      },
      {
        sequelize,
        ...BaseModel.initOptions('PromptHistory'),
        indexes: [
          {
            fields: ['user_id']
          },
          {
            fields: ['project_id']
          },
          {
            fields: ['status']
          },
          {
            fields: ['created_at']
          }
        ]
      }
    )
  }
}

// Mongoose Model
import mongoose, { Schema } from 'mongoose'
import { IBaseDocument, baseSchema } from './base.model'

export interface IPromptHistoryDocument extends IBaseDocument, Omit<PromptHistory, 'id' | 'createdAt' | 'updatedAt'> {}

const promptHistoryMongooseSchema = new Schema<IPromptHistoryDocument>({
  ...baseSchema,
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
    required: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  projectId: {
    type: String,
    required: false,
    ref: 'Project'
  },
  tokensUsed: {
    type: Number,
    required: false,
    min: 0
  },
  processingTime: {
    type: Number,
    required: false,
    min: 0
  }
}, {
  timestamps: true
})

// Indexes
promptHistoryMongooseSchema.index({ userId: 1, createdAt: -1 })
promptHistoryMongooseSchema.index({ projectId: 1 })
promptHistoryMongooseSchema.index({ status: 1 })
promptHistoryMongooseSchema.index({ createdAt: -1 })

export const PromptHistoryMongooseModel = mongoose.model<IPromptHistoryDocument>('PromptHistory', promptHistoryMongooseSchema)