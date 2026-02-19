// ================= ENUM TYPES =================

export type ProjectStatus =
  | 'draft'
  | 'processing'
  | 'completed'
  | 'failed'

export type UserRole =
  | 'admin'
  | 'user'
  | 'viewer'

export type PromptStatus =
  | 'pending'
  | 'processed'
  | 'failed'

export type OpenSpecVersion =
  | 'v1'
  | 'v2'

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

// ================= BASE ENTITY =================

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// ================= USER =================

export interface User extends BaseEntity {
  email: string
  name: string
  password?: string // Added password field (optional because it might not be returned in API responses)
  avatar?: string
  role: UserRole
  isActive: boolean
  lastLogin?: Date
  projects?: Project[]
  prompts?: PromptHistory[]
}

// ================= PROJECT =================

export interface Project extends BaseEntity {
  name: string
  description?: string
  status: ProjectStatus
  openSpec: OpenSpec
  generatedCode?: string
  previewUrl?: string
  repositoryUrl?: string
  userId: string
  user?: User
  prompts?: PromptHistory[]
  collaborators?: ProjectCollaborator[]
}

// ================= OPEN SPEC =================

export interface OpenSpec {
  version: OpenSpecVersion
  project: {
    name: string
    description: string
    namespace: string
    phpVersion?: string
    laravelVersion?: string
  }
  database: DatabaseSpec
  models: Model[]
  controllers: Controller[]
  routes: Route[]
  views?: View[]
  authentication?: AuthConfig
  api?: APIConfig
}

export interface DatabaseSpec {
  connection: 'mysql' | 'pgsql' | 'sqlite' | 'sqlsrv'
  databaseName: string
  tables: Table[]
}

export interface Table {
  name: string
  columns: Column[]
  indexes?: Index[]
  foreignKeys?: ForeignKey[]
  timestamps?: boolean
  softDeletes?: boolean
}

export interface Column {
  name: string
  type: string
  length?: number
  nullable?: boolean
  unsigned?: boolean
  autoIncrement?: boolean
  default?: unknown
  primary?: boolean
  comment?: string
}

export interface Index {
  name: string
  columns: string[]
  unique?: boolean
}

export interface ForeignKey {
  column: string
  references: string
  on: string
  onDelete?: 'cascade' | 'restrict' | 'set null' | 'no action'
  onUpdate?: 'cascade' | 'restrict' | 'set null' | 'no action'
}

// ================= MODEL DEFINITION =================

export interface Model {
  name: string
  table?: string
  fillable?: string[]
  guarded?: string[]
  hidden?: string[]
  casts?: Record<string, string>
  relationships?: Relationship[]
  traits?: string[]
  scopes?: Scope[]
}

export interface Relationship {
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany'
  related: string
  name: string
  foreignKey?: string
  localKey?: string
}

export interface Scope {
  name: string
  parameters?: string[]
}

// ================= CONTROLLER =================

export interface Controller {
  name: string
  model?: string
  resource?: boolean
  methods?: ControllerMethod[]
  middleware?: string[]
}

export interface ControllerMethod {
  name: string
  route?: string
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  parameters?: string[]
  logic?: string
}

// ================= ROUTE =================

export interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  uri: string
  controller: string
  action: string
  name?: string
  middleware?: string[]
}

// ================= VIEW =================

export interface View {
  name: string
  template: string
  data?: string[]
  layout?: string
}

// ================= AUTH =================

export interface AuthConfig {
  enabled: boolean
  guard?: 'web' | 'api'
  provider?: 'users'
  registration?: boolean
  passwordReset?: boolean
  emailVerification?: boolean
}

export interface APIConfig {
  enabled: boolean
  prefix?: string
  version?: string
  rateLimiting?: boolean
  sanctum?: boolean
}

// ================= PROMPT HISTORY =================

export interface PromptHistory extends BaseEntity {
  prompt: string
  response: OpenSpec
  status: PromptStatus
  userId: string
  user?: User
  projectId?: string
  project?: Project
  tokensUsed?: number
  processingTime?: number
}

// ================= PROJECT COLLABORATOR =================

export type CollaboratorRole = 'owner' | 'editor' | 'viewer'

export interface ProjectCollaborator {
  projectId: string
  userId: string
  role: CollaboratorRole
  joinedAt: Date
  project?: Project
  user?: User
}

// ================= AUDIT LOG =================

export interface AuditLog extends BaseEntity {
  userId: string
  action: string
  entityType: string
  entityId: string
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string
  userAgent?: string
}

// ================= NOTIFICATION =================

export interface Notification extends BaseEntity, Record<string, unknown> {
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  readAt?: Date
  actionUrl?: string
}

// ================= API RESPONSE =================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    timestamp: Date
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// ================= QUERY PARAMS =================

export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, unknown>
}

export interface ProjectFilter extends QueryParams {
  status?: ProjectStatus
  userId?: string
}

export interface PromptFilter extends QueryParams {
  status?: PromptStatus
  userId?: string
  projectId?: string
}

// ================= DASHBOARD =================

export interface DashboardStats {
  totalProjects: number
  totalUsers: number
  projectsByStatus: Record<ProjectStatus, number>
  recentProjects: Project[]
  recentPrompts: PromptHistory[]
  topUsers: {
    userId: string
    userName: string
    projectCount: number
  }[]
  activityChart: {
    date: string
    projects: number
    prompts: number
  }[]
}