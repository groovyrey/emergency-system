"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = process.env.PORT || 3000;
app_1.io.on('connection', (socket) => {
    console.log('New client connected:', socket.id, 'Transport:', socket.conn.transport.name);
    socket.conn.on('upgrade', () => {
        console.log('Socket upgraded to:', socket.conn.transport.name);
    });
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });
    socket.on('error', (error) => {
        console.error('Socket error for client:', socket.id, error);
    });
});
app_1.server.listen(PORT, () => {
    console.log(`Emergency Alert System server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    app_1.userModel.close();
    app_1.server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    app_1.userModel.close();
    app_1.server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
