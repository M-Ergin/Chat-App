const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');

app.use(express.static(path.join(__dirname, '/sayfa/')));
app.get('/', (req, res) => res.sendFile(__dirname + '/sayfa/sayfa.html'));


io.on('connection', (socket) => {
    const userId = uuidv4();
    socket.userId = userId;
    console.log('a user connected', userId);

    socket.emit('user connected', { userId });

    socket.on('chat message', (data) => {
        io.emit('chat message', {
            username: socket.username,
            message: data.message,
            userId: socket.userId
        });
    });

    socket.on('user disconnected', (username) => {
        if (socket.username) {
            io.emit('chat message', {
                username: 'Sistem',
                message: `${username} sohbetten ayrıldı.`,
                timestamp: new Date().toISOString(),
                userId: 'system'
            });
        }
    });

    socket.on('user connected', (username) => {
        socket.username = username;
        io.emit('chat message', {
            username: 'Sistem',
            message: `${username} sohbete katıldı.`
        });
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected', userId);
        io.emit('chat message', {
            username: 'Sistem',
            message: `${socket.username} sohbetten ayrıldı.`
        });
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
