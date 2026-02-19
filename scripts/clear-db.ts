import { Client } from 'pg';
import { loadEnvConfig } from '@next/env';
import path from 'path';

// Load environment variables
const projectDir = path.resolve(process.cwd());
loadEnvConfig(projectDir);

async function clearDatabase() {
    console.log('🧹 Starting database cleanup...');

    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
    };

    const client = new Client(config);

    try {
        await client.connect();
        console.log('✅ Connected to database.');

        // Start transaction
        await client.query('BEGIN');

        // 1. Delete all prompt history (if exists)
        console.log('🗑️ Deleting prompt history...');
        try {
            await client.query('DELETE FROM prompt_history');
        } catch (e: any) {
            if (e.code === '42P01') console.log('   Table prompt_history does not exist, skipping.');
            else throw e;
        }

        // 2. Delete all project collaborators (if table exists)
        console.log('🗑️ Deleting project collaborators...');
        try {
            await client.query('DELETE FROM project_collaborators');
        } catch (e: any) {
            if (e.code === '42P01') console.log('   Table project_collaborators does not exist, skipping.');
            else throw e;
        }

        // 3. Delete all projects
        console.log('🗑️ Deleting projects...');
        await client.query('DELETE FROM projects');

        // 4. Delete all notifications (if exists)
        console.log('🗑️ Deleting notifications...');
        try {
            await client.query('DELETE FROM notifications');
        } catch (e: any) {
            if (e.code === '42P01') console.log('   Table notifications does not exist, skipping.');
            else throw e;
        }

        // 5. Delete all audit logs (if exists)
        console.log('🗑️ Deleting audit logs...');
        try {
            await client.query('DELETE FROM audit_logs');
        } catch (e: any) {
            if (e.code === '42P01') console.log('   Table audit_logs does not exist, skipping.');
            else throw e;
        }

        // 6. Delete users
        console.log('🗑️ Deleting users (except default admin)...');
        const result = await client.query("DELETE FROM users WHERE email NOT IN ('developer@miomidev.com')");
        console.log(`   Deleted ${result.rowCount} users.`);

        await client.query('COMMIT');
        console.log('✨ Database cleared successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error clearing database:', error);
    } finally {
        await client.end();
    }
}

clearDatabase();
