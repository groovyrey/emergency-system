import pool from './src/db';

async function setup() {
    try {
        console.log('Starting Database Setup...');
        
        // Ensure table exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                parentsName VARCHAR(255) NOT NULL,
                parentsEmail VARCHAR(255) NOT NULL,
                parentsContact VARCHAR(50) NOT NULL,
                createdAt DATETIME NOT NULL,
                qrCodeUrl VARCHAR(255) NOT NULL
            )
        `;

        await pool.execute(createTableQuery);
        console.log('SUCCESS: "users" table created or already exists.');
        
        process.exit(0);
    } catch (error) {
        console.error('ERROR during database setup:', error);
        process.exit(1);
    }
}

setup();
