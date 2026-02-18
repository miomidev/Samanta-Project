import {
    DataTypes,
    InitOptions,
    Model,
    ModelAttributes
} from 'sequelize'

export abstract class BaseModel<
  TAttributes extends object,
  TCreationAttributes extends object = TAttributes
> extends Model<TAttributes, TCreationAttributes> {

  public id!: string
  public createdAt!: Date
  public updatedAt!: Date

  static initAttributes: ModelAttributes = {
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

  static initOptions(modelName: string): Partial<InitOptions> {
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