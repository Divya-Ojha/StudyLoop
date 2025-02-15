//Node server which will handle socket io communication
import express from 'express';
import http from 'http';
import {Server} from "socket.io";

import cors from 'cors';
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

const app = express();
const server = http.createServer(app); // Create an HTTP server from Express
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow connection from frontend
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: "http://localhost:3000" // Allow cross-origin requests from frontend
}));
const users={};
io.on('connection',socket=>{
    socket.on('new-user-joined',name =>{
        users[socket.id]=name;
        socket.broadcast.emit('user-joined',name);
    })
    socket.on('send', message => {
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    })
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    })
    socket.on('video-new-user-joined',(roomId,userId)=>{
        console.log(roomId,userId)
    })
})
server.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
  })
