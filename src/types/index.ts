export interface EmergencyUser {
    id: string;
    name: string;
    parentsName: string;
    parentsEmail: string;
    parentsContact: string;
    createdAt: Date;
    qrCodeUrl: string;
}

export interface AlertNotification {
    userId: string;
    userName: string;
    parentsName: string;
    parentsEmail: string;
    parentsContact: string;
    timestamp: Date;
    alertType: 'emergency';
}