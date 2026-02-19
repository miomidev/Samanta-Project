import { Sequelize } from 'sequelize';
import { defaultConfig } from '@/config/database';
import { UserModel } from '@/models/user.model';
import { ProjectModel } from '@/models/project.model';
import { ProjectCollaboratorModel } from '@/models/project-collaborator.model';
import { PromptHistoryModel } from '@/models/prompt-history.model';
import { NotificationModel } from '@/models/notification.model';
import { AuditLogModel } from '@/models/audit-log.model';

// Singleton handling for Next.js hot reloading
const globalForSequelize = global as unknown as { sequelize: Sequelize };

export const sequelize = globalForSequelize.sequelize || new Sequelize(
  defaultConfig.database,
  defaultConfig.username,
  defaultConfig.password,
  {
    host: defaultConfig.host,
    port: defaultConfig.port,
    dialect: (defaultConfig.type === 'postgresql' || defaultConfig.type === 'postgres') ? 'postgres' : 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: defaultConfig.pool,
    dialectOptions: {
      // typeCast: function (field: any, next: any) {
      //   if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
      //     return new Date(field.string());
      //   }
      //   return next();
      // },
    }
  }
);

if (process.env.NODE_ENV !== 'production') globalForSequelize.sequelize = sequelize;

// Models Registry
const models = {
  UserModel,
  ProjectModel,
  ProjectCollaboratorModel,
  PromptHistoryModel,
  NotificationModel,
  AuditLogModel
};

// Initialize Models
Object.values(models).forEach((model: any) => {
  if (typeof model.initModel === 'function') {
    model.initModel(sequelize);
  }
});

// Run Associations
Object.values(models).forEach((model: any) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Sync database in development (optional, use migrations in production)
// if (process.env.NODE_ENV === 'development') {
//   sequelize.sync({ alter: true }).then(() => {
//     console.log('Database synced successfully');
//   }).catch(err => console.error('Sync error:', err));
// }

export { models };
