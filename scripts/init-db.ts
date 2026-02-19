import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local before importing configuration
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Dynamic imports to ensure env vars are loaded first
async function initDatabase() {
  const { defaultConfig } = await import('../src/config/database');
  const { SchemaGenerator } = await import('../src/database/schema');

  // Conditionally import drivers
  let mysql;
  let Client;

  console.log('Initializing database...');
  console.log(`Type: ${defaultConfig.type}`);
  console.log(`Target Host: ${defaultConfig.host}`);
  console.log(`Target Database: ${defaultConfig.database}`);

  const adminPassword = 'password';
  const adminHash = bcrypt.hashSync(adminPassword, 10);
  console.log(`Generated Admin Password Hash: ${adminHash.substring(0, 10)}...`);

  if (defaultConfig.type === 'mysql') {
    mysql = (await import('mysql2/promise')).default;
    await initMySQL(adminHash, defaultConfig, mysql, SchemaGenerator);
  } else if (defaultConfig.type === 'postgresql' || defaultConfig.type === 'postgres') {
    const pgModule = await import('pg');
    Client = pgModule.Client;
    await initPostgres(adminHash, defaultConfig, Client, SchemaGenerator);
  } else {
    console.error(`❌ Unsupported database type: ${defaultConfig.type}`);
    process.exit(1);
  }
}

async function initMySQL(adminHash: string, defaultConfig: any, mysql: any, SchemaGenerator: any) {
  const config = {
    host: defaultConfig.host,
    port: defaultConfig.port,
    user: defaultConfig.username,
    password: defaultConfig.password,
    multipleStatements: true
  };

  let connection;

  try {
    try {
      connection = await mysql.createConnection(config);
      console.log(`Connected to MySQL at ${config.host}:${config.port}`);
    } catch (connError: any) {
      handleConnectionError(connError, config.host, config.port, config.user);
    }

    // Create database if not exists
    await connection!.query(`CREATE DATABASE IF NOT EXISTS \`${defaultConfig.database}\`;`);
    console.log(`Database '${defaultConfig.database}' created or already exists.`);

    // Switch to the database
    await connection!.changeUser({ database: defaultConfig.database });

    // Generate Schema
    console.log('Generating schema for MySQL...');
    const sqlSchema = SchemaGenerator.generateMySQL(adminHash);

    // Execute Schema
    console.log('Executing schema statements...');
    try {
      await connection!.query(sqlSchema);
      console.log('✅ Schema executed successfully!');
    } catch (queryError: any) {
      if (queryError.code === 'ER_TABLE_EXISTS_ERROR') {
        console.warn('⚠️  Warning: Tables already exist. Some statements might have failed.');
      } else {
        throw queryError;
      }
    }

    await connection!.end();

  } catch (error: any) {
    console.error('\n❌ Fatal Error initializing MySQL database:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

async function initPostgres(adminHash: string, defaultConfig: any, Client: any, SchemaGenerator: any) {
  const adminConfig = {
    host: defaultConfig.host,
    port: defaultConfig.port,
    user: defaultConfig.username,
    password: defaultConfig.password,
    database: 'postgres', // Connect to default maintenance db
  };

  let client;

  try {
    // 1. Create Database if not exists
    try {
      client = new Client(adminConfig);
      await client.connect();
      console.log(`Connected to PostgreSQL at ${adminConfig.host}:${adminConfig.port}`);

      const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
      const checkRes = await client.query(checkDbQuery, [defaultConfig.database]);

      if (checkRes.rowCount === 0) {
        console.log(`Database '${defaultConfig.database}' does not exist. Creating...`);
        await client.query(`CREATE DATABASE "${defaultConfig.database}"`);
        console.log(`Database '${defaultConfig.database}' created.`);
      } else {
        console.log(`Database '${defaultConfig.database}' already exists.`);
      }
      await client.end();
    } catch (connError: any) {
      handleConnectionError(connError, adminConfig.host, adminConfig.port, adminConfig.user);
    }

    // 2. Connect to target database and run schema
    const targetConfig = {
      ...adminConfig,
      database: defaultConfig.database
    };

    client = new Client(targetConfig);
    await client.connect();
    console.log(`Connected to database '${defaultConfig.database}'`);

    console.log('Generating schema for PostgreSQL...');
    const sqlSchema = SchemaGenerator.generatePostgreSQL(adminHash);

    console.log('Executing schema statements...');

    // Postgres client executes the whole string as a transaction block if possible, or we can just run it.
    // However, CREATE TYPE inside a transaction block in simple query mode works.
    // But "DO $$ ..." blocks are good for control structures.
    // Our schema generator uses DO $$ blocks for types, which is fine.

    try {
      await client.query(sqlSchema);
      console.log('✅ Schema executed successfully!');
    } catch (queryError: any) {
      console.error('⚠️ Error executing schema:', queryError.message);
      // Don't exit process here, maybe partial success?
    }

    await client.end();

  } catch (error: any) {
    console.error('\n❌ Fatal Error initializing PostgreSQL database:', error.message);
    if (client) await client.end();
    process.exit(1);
  }
}

function handleConnectionError(error: any, host: string, port: number, user: string) {
  if (error.code === 'ECONNREFUSED') {
    console.error('\n❌ ERROR: Could not connect to database server.');
    console.error(`   Please ensure database is running on ${host}:${port}`);
    process.exit(1);
  }
  if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === '28P01') { // 28P01 is Postgres password auth failed
    console.error('\n❌ ERROR: Access denied.');
    console.error(`   Please check your username ('${user}') and password.`);
    process.exit(1);
  }
  throw error;
}

initDatabase();
