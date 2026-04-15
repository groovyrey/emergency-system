import { EmergencyUser } from "../types";
import { v4 as uuidv4 } from 'uuid';
import pool from '../db';
import { RowDataPacket } from 'mysql2';

export class UserModel {
    // In-memory fallback if DB is down
    private fallbackUsers: Map<string, EmergencyUser> = new Map();
    private isDbConnected: boolean = true;

    constructor() {
        this.checkConnection();
    }

    private async checkConnection() {
        try {
            const connection = await pool.getConnection();
            connection.release();
            this.isDbConnected = true;
            console.log('✅ Database connected successfully.');
        } catch (error) {
            this.isDbConnected = false;
            console.error('❌ Database connection failed. Falling back to in-memory storage.');
            console.error('Reason:', error instanceof Error ? error.message : String(error));
        }
    }

    async create(userData: Omit<EmergencyUser, 'id' | 'createdAt' | 'qrCodeUrl'>): Promise<EmergencyUser> {
        const id = uuidv4();
        const createdAt = new Date();
        const qrCodeUrl = `/qrcodes/${id}.png`;
        const newUser: EmergencyUser = { id, ...userData, createdAt, qrCodeUrl };

        if (this.isDbConnected) {
            try {
                const query = `
                    INSERT INTO users (id, name, parentsName, parentsEmail, parentsContact, createdAt, qrCodeUrl)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await pool.execute(query, [id, userData.name, userData.parentsName, userData.parentsEmail, userData.parentsContact, createdAt, qrCodeUrl]);
            } catch (error) {
                console.error('❌ Database INSERT failed, saving to memory only.');
                console.error(error);
                // Even if it fails once, we might want to keep isDbConnected true to retry later, 
                // or set it false if it's a connection issue. For now, let's just log and fallback.
            }
        }

        // Always save to fallback to ensure the app "works" in the current session
        this.fallbackUsers.set(id, newUser);
        return newUser;
    }

    async findById(id: string): Promise<EmergencyUser | undefined> {
        if (this.isDbConnected) {
            try {
                const query = 'SELECT * FROM users WHERE id = ?';
                const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
                if (rows.length > 0) return rows[0] as EmergencyUser;
            } catch (error) {
                console.error('❌ Database SELECT by ID failed, checking memory.');
                console.error(error);
            }
        }
        return this.fallbackUsers.get(id);
    }

    async getAllUsers(): Promise<EmergencyUser[]> {
        if (this.isDbConnected) {
            try {
                const query = 'SELECT * FROM users ORDER BY createdAt DESC';
                const [rows] = await pool.execute<RowDataPacket[]>(query);
                const dbUsers = rows as EmergencyUser[];
                
                // Merge with in-memory users that might not be in DB
                const allUsersMap = new Map();
                dbUsers.forEach(u => allUsersMap.set(u.id, u));
                this.fallbackUsers.forEach(u => allUsersMap.set(u.id, u));
                
                return Array.from(allUsersMap.values());
            } catch (error) {
                console.error('❌ Database SELECT ALL failed, returning memory users only.');
                console.error(error);
            }
        }
        return Array.from(this.fallbackUsers.values());
    }
}
