// config/database.ts
export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'postgres' | 'sqlite' | 'mongodb'
  host: string
  port: number
  username: string
  password: string
  database: string
  ssl?: boolean
  pool?: {
    min: number
    max: number
  }
}

export const defaultConfig: DatabaseConfig = {
  type: (process.env.DB_TYPE as any) || 'mysql',
  host: process.env.DB_HOST || '127.0.0.1', // Default to 127.0.0.1 to avoid ipv6 issues
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jadiin_db',
  pool: {
    min: 2,
    max: 10
  }
}