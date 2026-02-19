import mysql from 'mysql2/promise';
import { SchemaGenerator } from '../src/database/schema';
import { defaultConfig } from '../src/config/database';

async function initDatabase() {
  console.log('Initializing database...');
  console.log(`Target Host: ${defaultConfig.host}`);
  console.log(`Target Database: ${defaultConfig.database}`);

  const config = {
    host: defaultConfig.host,
    port: defaultConfig.port,
    user: defaultConfig.username,
    password: defaultConfig.password,
    multipleStatements: true // Required to run multiple SQL queries at once
  };

  let connection;

  try {
    // 1. Connect without database selected to create it if needed
    try {
      connection = await mysql.createConnection(config);
      console.log(`Connected to MySQL at ${config.host}:${config.port}`);
    } catch (connError: any) {
      if (connError.code === 'ECONNREFUSED') {
        console.error('\n❌ ERROR: Could not connect to MySQL server.');
        console.error(`   Please ensure MySQL is running on ${config.host}:${config.port}`);
        console.error('   If using XAMPP/WAMP, start the MySQL module.');
        process.exit(1);
      }
      if (connError.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('\n❌ ERROR: Access denied.');
        console.error(`   Please check your username ('${config.user}') and password.`);
        process.exit(1);
      }
      throw connError;
    }

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${defaultConfig.database}\`;`);
    console.log(`Database '${defaultConfig.database}' created or already exists.`);
    
    // Switch to the database
    await connection.changeUser({ database: defaultConfig.database });

    // 2. Generate Schema
    console.log('Generating schema...');
    
    // Generate password hash on the fly using imported bcryptjs or a default if missing?
    // We need to import it. Let's assume it's available since we installed it.
    // However, require might be needed if import fails? No, import is standard in tsx.
    const bcrypt = require('bcryptjs');
    const adminPassword = 'password123';
    const adminHash = bcrypt.hashSync(adminPassword, 10);
    console.log(`Generated Admin Password Hash for '${adminPassword}': ${adminHash.substring(0, 10)}...`);

    // We generated MySQL schema with the hash
    const sqlSchema = SchemaGenerator.generateMySQL(adminHash);
    
    // 3. Execute Schema
    console.log('Executing schema statements...');
    
    // We wrap in a try/catch for query execution
    try {
      await connection.query(sqlSchema);
      console.log('✅ Schema executed successfully!');
    } catch (queryError: any) {
      // Check for common schema errors
      if (queryError.code === 'ER_TABLE_EXISTS_ERROR') {
        console.warn('⚠️  Warning: Tables already exist. Some statements might have failed.');
      } else {
        throw queryError;
      }
    }
    
    await connection.end();
  } catch (error: any) {
    console.error('\n❌ Fatal Error initializing database:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDatabase();
