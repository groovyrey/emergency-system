import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { AlertNotification } from '../types';

export class NotificationService {
    private transporter: nodemailer.Transporter;
    private twilioClient: twilio.Twilio | null = null;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Initialize Twilio client if credentials are available
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (accountSid && authToken && accountSid !== 'your-twilio-account-sid' && authToken !== 'your-twilio-auth-token') {
            this.twilioClient = twilio(accountSid, authToken);
        }
    }

    async sendEmailAlert(notification: AlertNotification): Promise<void> {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-email-password') {
            console.log('Email credentials not configured. Skipping email alert.');
            console.log('Alert details:', {
                to: notification.parentsEmail,
                subject: `Emergency Alert Notification - ${notification.userName}`,
                userName: notification.userName,
                parentsName: notification.parentsName,
                parentsContact: notification.parentsContact,
                alertType: notification.alertType,
                timestamp: notification.timestamp.toLocaleString()
            });
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: notification.parentsEmail,
            subject: `Emergency Alert Notification - ${notification.userName}`,
            html: `
            <div style = "font-family: Arial, sans-serif; max-width: 600px;" margin: 0 auto;">
            <h2 style="color: #d32f2f;">Emergency Alert Notification</h2>
            <p><strong>User Name:</strong> ${notification.userName}</p>
            <p><strong>Parent's Name:</strong> ${notification.parentsName}</p>
            <p><strong>Parent's Contact:</strong> ${notification.parentsContact}</p>
            <p><strong>Alert Type:</strong> ${notification.alertType}</p>
            <p><strong>Timestamp:</strong> ${notification.timestamp.toLocaleString()}</p>
            <div style="background: #ffebee; padding: 20px; border-left: 4px solid #d32f2f; margin-top: 20px;">  
            <h3>EMERGENCY ALERT REQUIRED</h3>
            <p>This is an automated emergency alert notification. Please take immediate action to ensure the safety of your child.</p>
            </div>
            </div>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendSMSAlert(parentsPhone: string, message: string): Promise<void> {
        if (!this.twilioClient) {
            console.log('Twilio credentials not configured. Skipping SMS alert.');
            console.log(`SMS details: To: ${parentsPhone}, Message: ${message}`);
            return;
        }

        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
        if (!twilioPhoneNumber || twilioPhoneNumber === 'your-twilio-phone-number') {
            console.log('Twilio phone number not configured. Skipping SMS alert.');
            console.log(`SMS details: To: ${parentsPhone}, Message: ${message}`);
            return;
        }

        try {
            await this.twilioClient.messages.create({
                body: message,
                from: twilioPhoneNumber,
                to: parentsPhone
            });
            console.log(`SMS alert sent successfully to ${parentsPhone}`);
        } catch (error) {
            console.error('Failed to send SMS alert:', error);
            console.log(`SMS details: To: ${parentsPhone}, Message: ${message}`);
        }
    }
}