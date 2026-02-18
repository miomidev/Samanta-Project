import { DataTypes, Sequelize } from 'sequelize'
import { User, UserRole } from '../lib/types'
import { BaseModel } from './base.model'
import type { ModelRegistry } from './index'

/* ======================================================
   Sequelize Model
====================================================== */

export class UserModel
  extends BaseModel<User>
  implements User {

  public email!: string
  public name!: string
  public avatar?: string
  public role!: UserRole
  public isActive!: boolean
  public lastLogin?: Date

  /* =============================
     Associations
  ============================== */
  static associate(models: ModelRegistry) {
    UserModel.hasMany(models.ProjectModel, {
      foreignKey: 'userId',
      as: 'projects'
    })

    UserModel.hasMany(models.PromptHistoryModel, {
      foreignKey: 'userId',
      as: 'prompts'
    })

    UserModel.hasMany(models.NotificationModel, {
      foreignKey: 'userId',
      as: 'notifications'
    })

    UserModel.belongsToMany(models.ProjectModel, {
      through: models.ProjectCollaboratorModel,
      foreignKey: 'userId',
      otherKey: 'projectId',
      as: 'collaborations'
    })
  }

  /* =============================
     Init Model
  ============================== */
  static initModel(sequelize: Sequelize) {
    return UserModel.init(
      {
        ...BaseModel.initAttributes,

        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
            notEmpty: true
          }
        },

        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [2, 255]
          }
        },

        avatar: {
          type: DataTypes.TEXT,
          allowNull: true,
          validate: {
            isUrl: true
          }
        },

        role: {
          type: DataTypes.ENUM('admin', 'user', 'viewer'),
          allowNull: false,
          defaultValue: 'user'
        },

        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_active'
        },

        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'last_login'
        }
      },
      {
        sequelize,
        ...BaseModel.initOptions('User'),

        indexes: [
          {
            unique: true,
            fields: ['email']
          },
          {
            fields: ['role']
          },
          {
            fields: ['is_active']
          },
          {
            fields: ['created_at']
          }
        ]
      }
    )
  }
}

/* ======================================================
   Mongoose Model
====================================================== */

import mongoose, { Schema } from 'mongoose'
import { IBaseDocument, baseSchema } from './base.model'

export interface IUserDocument
  extends IBaseDocument,
  Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}

const userMongooseSchema = new Schema<IUserDocument>(
  {
    ...baseSchema,

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^\S+@\S+\.\S+$/.test(v),
        message: 'Invalid email format'
      }
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 255
    },

    avatar: {
      type: String,
      required: false
    },

    role: {
      type: String,
      enum: ['admin', 'user', 'viewer'],
      default: 'user',
      required: true
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true
    },

    lastLogin: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true,

    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)

/* =============================
   Indexes
============================= */

userMongooseSchema.index({ email: 1 }, { unique: true })
userMongooseSchema.index({ role: 1 })
userMongooseSchema.index({ isActive: 1 })
userMongooseSchema.index({ createdAt: -1 })

export const UserMongooseModel =
  mongoose.model<IUserDocument>('User', userMongooseSchema)