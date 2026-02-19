export * from './base.model'
export * from './user.model'
export * from './project.model'
export * from './project-collaborator.model'
export * from './prompt-history.model'
export * from './notification.model'
export * from './audit-log.model'

import { UserModel } from './user.model'
import { ProjectModel } from './project.model'
import { ProjectCollaboratorModel } from './project-collaborator.model'
import { PromptHistoryModel } from './prompt-history.model'
import { NotificationModel } from './notification.model'
import { AuditLogModel } from './audit-log.model'

export interface ModelRegistry {
  UserModel: typeof UserModel
  ProjectModel: typeof ProjectModel
  ProjectCollaboratorModel: typeof ProjectCollaboratorModel
  PromptHistoryModel: typeof PromptHistoryModel
  NotificationModel: typeof NotificationModel
  AuditLogModel: typeof AuditLogModel
}