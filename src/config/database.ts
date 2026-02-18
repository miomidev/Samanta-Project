// config/database.ts
export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb'
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
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'jadiin_db',
  pool: {
    min: 2,
    max: 10
  }
}