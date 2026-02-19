// models/base.model.ts
import { DataTypes, Model } from 'sequelize'

export abstract class BaseModel<
  TAttributes extends object,
  TCreationAttributes extends object = TAttributes
> extends Model<TAttributes, TCreationAttributes> {
  public id!: string
  public createdAt!: Date
  public updatedAt!: Date

  static initAttributes = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }

  static initOptions(modelName: string) {
    return {
      modelName,
      timestamps: true,
      underscored: true,
      freezeTableName: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
}

// Mongoose Base Schema
import { Document } from 'mongoose'

export interface IBaseDocument extends Document {
  id: string
  createdAt: Date
  updatedAt: Date
}

export const baseSchema = {
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}