// types/sequelize-models.ts
import { AuditLogModel } from '../models/audit-log.model'
import { UserModel } from '../models/user.model'

export interface SequelizeModels {
  AuditLogModel: typeof AuditLogModel
  UserModel: typeof UserModel
}