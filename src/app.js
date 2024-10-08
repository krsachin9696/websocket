import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const users = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Prompt for username when a user connects
  socket.emit('request name');

  socket.on('set name', (name) => {
    if (name) {
      users[socket.id] = name;
      console.log(`${name} joined the chat`);
      io.emit('chat message', `${name} has joined the chat`);
      io.emit('update users', Object.values(users));
    } else {
      socket.emit('request name');
    }
  });

  socket.on('chat message', (msg) => {
    const userName = users[socket.id] || 'Anonymous';
    io.emit('chat message', `${userName}: ${msg}`);
  });

  socket.on('private message', ({ message, recipient }) => {
    const sender = users[socket.id] || 'Anonymous';
    const recipientSocketId = Object.keys(users).find(
      (id) => users[id] === recipient,
    );
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private message', { message, sender });
    }
  });

  socket.on('disconnect', () => {
    const userName = users[socket.id] || 'Anonymous';
    delete users[socket.id];
    console.log(`${userName} disconnected`);
    io.emit('chat message', `${userName} has left the chat`);
    io.emit('update users', Object.values(users));
  });
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
