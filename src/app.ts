import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import { UserModel } from './models/User';
import { QRService } from './services/qrServices';
import { NotificationService } from './services/notificationService';
import { EmergencyUser, AlertNotification } from './types';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 20000,
  maxHttpBufferSize: 1e8,
  allowRequest: (req, callback) => {
    console.log('Socket.IO connection attempt from:', req.headers.origin, 'Method:', req.method);
    console.log('Socket.IO request headers:', req.headers);
    callback(null, true);
  }
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/qrcodes', express.static(path.join(process.cwd(), 'public', 'qrcodes')));

const userModel = new UserModel();
const qrService = new QRService();
const notificationService = new NotificationService();

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
  try {
    let { name, parentsName, parentsEmail, parentsContact } = req.body;

    // Provide default values if fields are empty
    name = name || 'User ' + Math.random().toString(36).substr(2, 9);
    parentsName = parentsName || 'Parent';
    parentsEmail = parentsEmail || 'noemail@example.com';
    parentsContact = parentsContact || '+1000000000';

    const user = await userModel.create({
      name,
      parentsName,
      parentsEmail,
      parentsContact
    });

    const qrData = qrService.createQRData(user.id);
    const qrCodeUrl = await qrService.generateQRCode(qrData, `${user.id}.png`);

    const updatedUser = { ...user, qrCodeUrl };

    res.json({
      success: true,
      user: updatedUser,
      message: 'Emergency sign-up successful! QR code generated.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user by ID (QR scan endpoint)
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Send emergency alert
app.post('/api/alert/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const alert: AlertNotification = {
      userId: user!.id,
      userName: user!.name,
      parentsName: user!.parentsName,
      parentsEmail: user!.parentsEmail,
      parentsContact: user!.parentsContact,
      timestamp: new Date(),
      alertType: 'emergency'
    };

    // Send notifications
    await notificationService.sendEmailAlert(alert);
    await notificationService.sendSMSAlert(user!.parentsContact,
      `EMERGENCY: ${user!.name} needs help! Contact immediately.`
    );

    // Broadcast to connected devices
    console.log('Broadcasting emergency alert to all connected clients:', alert);
    io.emit('emergencyAlert', alert);
    console.log('Emergency alert broadcast complete');

    res.json({ success: true, message: 'Emergency alert sent!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send alert' });
  }
});

// Serve QR scan page
app.get('/scan/:id', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Get all users (for admin purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

export { app, server, io, userModel };