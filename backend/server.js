const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const crisisRoutes = require('./routes/crisis');
const volunteerRoutes = require('./routes/volunteer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/volunteer', volunteerRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Crisis Connect API is running!' });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('join_volunteer', (data) => {
    socket.join('volunteers');
    console.log('Volunteer joined room:', data);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));