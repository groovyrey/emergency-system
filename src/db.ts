import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: mysql.Pool;

try {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'emergency_db',
        port: parseInt(process.env.DB_PORT || '3306'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 5000 // 5 seconds timeout
    });
} catch (error) {
    console.error('❌ Failed to initialize MySQL Pool. Make sure MySQL client is installed.');
    // Provide a dummy pool or let the UserModel handle the undefined/null
}

export default pool!;
