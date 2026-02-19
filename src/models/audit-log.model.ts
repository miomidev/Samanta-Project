// models/audit-log.model.ts
import { DataTypes, Sequelize } from 'sequelize'
import { AuditLog } from '../lib/types'
import { BaseModel } from './base.model'
import { ModelRegistry } from './index'

export class AuditLogModel extends BaseModel<AuditLog> implements AuditLog {
  public userId!: string
  public action!: string
  public entityType!: string
  public entityId!: string
  public oldValue?: Record<string, unknown>
  public newValue?: Record<string, unknown>
  public ipAddress?: string
  public userAgent?: string

  static associate(models: ModelRegistry) {
    AuditLogModel.belongsTo(models.UserModel, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  static initModel(sequelize: Sequelize) {
    return AuditLogModel.init(
      {
        ...BaseModel.initAttributes,
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },
        entityType: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'entity_type',
          validate: {
            isIn: [['User', 'Project', 'PromptHistory', 'Notification']]
          }
        },
        entityId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'entity_id'
        },
        oldValue: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'old_value'
        },
        newValue: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'new_value'
        },
        ipAddress: {
          type: DataTypes.STRING(45),
          allowNull: true,
          field: 'ip_address',
          validate: {
            isIP: true
          }
        },
        userAgent: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'user_agent'
        }
      },
      {
        sequelize,
        ...BaseModel.initOptions('AuditLog'),
        tableName: 'audit_logs',
        indexes: [
          {
            fields: ['user_id']
          },
          {
            fields: ['entity_type', 'entity_id']
          },
          {
            fields: ['action']
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


export interface IAuditLogDocument extends IBaseDocument, Omit<AuditLog, 'id' | 'createdAt' | 'updatedAt'> { }

const auditLogMongooseSchema = new Schema<IAuditLogDocument>({
  ...baseSchema,
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Project', 'PromptHistory', 'Notification']
  },
  entityId: {
    type: String,
    required: true
  },
  oldValue: {
    type: Schema.Types.Mixed,
    required: false
  },
  newValue: {
    type: Schema.Types.Mixed,
    required: false
  },
  ipAddress: {
    type: String,
    required: false,
    validate: {
      validator: (v: string) => !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v),
      message: 'Invalid IP address'
    }
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

// Indexes
auditLogMongooseSchema.index({ userId: 1, createdAt: -1 })
auditLogMongooseSchema.index({ entityType: 1, entityId: 1 })
auditLogMongooseSchema.index({ action: 1 })
auditLogMongooseSchema.index({ createdAt: -1 })

export const AuditLogMongooseModel = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', auditLogMongooseSchema)