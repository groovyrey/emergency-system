import { EmergencyUser } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class UserModel  {
    public users: Map<string, EmergencyUser> = new Map();

    create(userData: Omit<EmergencyUser, 'id' | 'createdAt' | 'qrCodeUrl'>): EmergencyUser {
        const id = uuidv4();
        const createdAt = new Date();
        const User: EmergencyUser = { 
            id,
            ...userData,
            createdAt,
            qrCodeUrl: `/qrcodes/${id}.png`
        };
        this.users.set(id, User);
        return User;
    }

    findById(id: string): EmergencyUser | undefined {
        return this.users.get(id);
    }

    getAllUsers(): EmergencyUser[] {
        return Array.from(this.users.values());
    }
}