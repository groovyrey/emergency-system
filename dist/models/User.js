"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
class UserModel {
    async create(userData) {
        const id = (0, uuid_1.v4)();
        const createdAt = new Date();
        const qrCodeUrl = `/qrcodes/${id}.png`;
        const query = `
            INSERT INTO users (id, name, parentsName, parentsEmail, parentsContact, createdAt, qrCodeUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db_1.default.execute(query, [
            id,
            userData.name,
            userData.parentsName,
            userData.parentsEmail,
            userData.parentsContact,
            createdAt,
            qrCodeUrl
        ]);
        return {
            id,
            ...userData,
            createdAt,
            qrCodeUrl
        };
    }
    async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await db_1.default.execute(query, [id]);
        if (rows.length === 0) {
            return undefined;
        }
        return rows[0];
    }
    async getAllUsers() {
        const query = 'SELECT * FROM users ORDER BY createdAt DESC';
        const [rows] = await db_1.default.execute(query);
        return rows;
    }
}
exports.UserModel = UserModel;
