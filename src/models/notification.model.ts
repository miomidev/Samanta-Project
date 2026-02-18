import { DataTypes, Sequelize } from 'sequelize'
import { Notification, NotificationType } from '../lib/types'
import { BaseModel } from './base.model'

export class NotificationModel
  extends BaseModel<Notification>
  implements Notification {
  [x: string]: unknown

  public userId!: string
  public type!: NotificationType
  public title!: string
  public message!: string
  public isRead!: boolean
  public readAt?: Date
  public actionUrl?: string

  static associate(models: any) {
    NotificationModel.belongsTo(models.UserModel, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  static initModel(sequelize: Sequelize) {
    return NotificationModel.init(
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

        type: {
          type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
          allowNull: false,
          defaultValue: 'info'
        },

        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [1, 255]
          }
        },

        message: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },

        isRead: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_read'
        },

        readAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'read_at'
        },

        actionUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'action_url',
          validate: {
            isUrl: true
          }
        }
      },
      {
        sequelize,
        ...BaseModel.initOptions('Notification'),
        indexes: [
          { fields: ['user_id'] },
          { fields: ['is_read'] },
          { fields: ['type'] },
          { fields: ['created_at'] }
        ]
      }
    )
  }
}