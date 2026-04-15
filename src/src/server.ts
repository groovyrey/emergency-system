import { app, io, server } from './app';
const PORT = process.env.PORT || 3000;

io.on('connection',(socket) => {
  console.log('New client connected', socket.id);

    socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    });
});

server.listen(PORT, () => {
  console.log(`Emergency Alert System server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});