//const express = require('express')
import express, {static as static_} from 'express';
//Primero dotenv que rutas
import dotenv from 'dotenv'
dotenv.config();

import swaggerJsDoc from 'swagger-jsdoc'
import { setup, serve} from  'swagger-ui-express'
import { Server } from 'http';
import socketIo, { Server as SocketServer } from 'socket.io';

import routes from './app/routes'

import { engine } from 'express-handlebars';

import path from 'path'

const PORT = process.env.PORT || 3000;
const app = express();

app.engine('handlebars',engine());
app.set('view engine','handlebars');
app.set('views','./src/views')



app.use('/static', static_(path.join(__dirname, '..','public')));

app.use(routes);

app.get('', (req, res)=> {
    res.render('login',{});
})

const server: Server = app.listen(PORT, () => {
    console.log(`app is running in http://localhost:${PORT}`)
});

const io = new SocketServer(server, {
    cors: {
        origin: '*'
    }
});

io.on('connection', (socket) => {
    console.log('Nueva conexión establecida');

    socket.on('joinRoom', ({ room, username }) => {
        socket.join(room);
        console.log(`${username} se unió a ${room}`);
        io.to(room).emit('messageReceived', { username: 'Sistema', message: `${username} se unió al chat`, room });
    });

    socket.on('messageSent', ({ room, username, message }) => {
        io.to(room).emit('messageReceived', { username, message, room });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

    socket.on('leaveRoom', ({ room, username }) => {
        socket.leave(room);
        io.to(room).emit('messageReceived', {
            username: 'Sistema',
            message: `${username} salió del chat`,
            room
        });
        console.log(`${username} salió de ${room}`);
    });

    socket.on('disconnect', () => {
        const username = socket.data.username;
        const room = socket.data.room;
        if (room && username) {
            io.to(room).emit('messageReceived', {
                username: 'Sistema',
                message: `${username} salió del chat`,
                room
            });
            console.log(`${username} se desconectó de ${room}`);
        }
    });
});

io.to('sala1').emit('evento', {});

