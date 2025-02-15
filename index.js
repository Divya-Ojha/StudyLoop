import mongoose from 'mongoose';
import { Users } from './templates/users.js';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import http from 'http';
import { Server } from "socket.io";
import { ExpressPeerServer } from 'peer';  
import dotenv from 'dotenv';
dotenv.config();
//import cors from 'cors';

const app = express();
const port = 3000;

// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
};
connectDB();

// ✅ Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/styles', express.static('styles'));
app.use('/media', express.static('media'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.get('/', (req, res) => {
  res.sendFile('templates/index.html', { root: __dirname });
});
app.get('/chat', (req, res) => {
  res.sendFile('templates/chat_application/chat.html', { root: __dirname });
});
app.get('/login', (req, res) => {
  res.sendFile('templates/login.html', { root: __dirname });
});
app.get('/signup', (req, res) => {
  res.sendFile('templates/signup.html', { root: __dirname });
});
app.get('/start', (req, res) => {
  res.sendFile('templates/start.html', { root: __dirname });
});
app.get('/videochat', (req, res) => {
  console.log('Video Chat');
  res.redirect(`/videochat/${uuidV4()}`);
});
app.get('/videochat/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});
// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Signup Request:', req.body);
  try {
    const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send('Username or email already exists.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).send('User signed up successfully.');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login Request:', req.body);
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password.');
    }
    res.status(200).send('Login successful!');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ Create Server & PeerJS
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, { debug: true});
app.use('/peerjs', peerServer);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const chatusers = {};
const videochatusers = {};

// ✅ WebSocket Connections
io.on('connection', socket => {
  console.log("Web socket connected",socket.id)
  // Chat Users
  socket.on('new-user-joined', name => {
    chatusers[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
  });

  socket.on('send', message => {
    socket.broadcast.emit('receive', { message, name: chatusers[socket.id] });
  });

  socket.on('disconnect', () => {
    if (chatusers[socket.id]) {
      socket.broadcast.emit('left', chatusers[socket.id]);
      delete chatusers[socket.id];
    }
  });

  socket.on('join-room', (roomId, userId, name) => {
    socket.join(roomId);
    console.log(`${name} joined ${roomId}`)
    videochatusers[socket.id] = { name,userId, roomId };  // ✅ Store roomId
    io.to(roomId).emit("video-new-user-joined", roomId, name, userId);
});

socket.on('disconnect', () => {
    const userData = videochatusers[socket.id];
    if (userData) {
        io.to(userData.roomId).emit("video-user-disconnected",userData.userId);
        console.log("WebSocket disconnected:",socket.id);
        delete videochatusers[socket.id];
    }
  
});
});

// ✅ Start Server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
