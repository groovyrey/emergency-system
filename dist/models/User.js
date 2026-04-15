"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const uuid_1 = require("uuid");
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class UserModel {
    constructor() {
        this.pool = promise_1.default.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'emergency_db',
            port: Number(process.env.DB_PORT || 3306),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        this.init();
    }
    async init() {
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                parentsName VARCHAR(255) NOT NULL,
                parentsEmail VARCHAR(255) NOT NULL,
                parentsContact VARCHAR(50) NOT NULL,
                createdAt VARCHAR(50) NOT NULL,
                qrCodeUrl VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await this.pool.query(createTableSql);
    }
    async create(userData) {
        const id = (0, uuid_1.v4)();
        const createdAt = new Date().toISOString();
        const qrCodeUrl = `/qrcodes/${id}.png`;
        await this.pool.execute('INSERT INTO users (id, name, parentsName, parentsEmail, parentsContact, createdAt, qrCodeUrl) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, userData.name, userData.parentsName, userData.parentsEmail, userData.parentsContact, createdAt, qrCodeUrl]);
        return {
            id,
            ...userData,
            createdAt: new Date(createdAt),
            qrCodeUrl
        };
    }
    async findById(id) {
        const [rows] = await this.pool.query('SELECT * FROM users WHERE id = ?', [id]);
        const row = rows[0];
        if (!row)
            return undefined;
        return {
            id: row.id,
            name: row.name,
            parentsName: row.parentsName,
            parentsEmail: row.parentsEmail,
            parentsContact: row.parentsContact,
            createdAt: new Date(row.createdAt),
            qrCodeUrl: row.qrCodeUrl
        };
    }
    async getAllUsers() {
        const [rows] = await this.pool.query('SELECT * FROM users');
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            parentsName: row.parentsName,
            parentsEmail: row.parentsEmail,
            parentsContact: row.parentsContact,
            createdAt: new Date(row.createdAt),
            qrCodeUrl: row.qrCodeUrl
        }));
    }
    async close() {
        await this.pool.end();
    }
}
exports.UserModel = UserModel;
