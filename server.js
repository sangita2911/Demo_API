require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
require('./config/database');

const server = http.createServer(app);

const port = process.env.PORT || 3049;

const io = require('socket.io')(server, {
  cors: {
    methods: ['GET', 'POST']
  }
});

io.sockets.on('connection', client => {
  client.on('chatListEvent', data => {
    io.sockets.emit('chatListEventResponse', data);
  });

  client.on('chatDetailsEvent', data => {
    io.sockets.emit('chatDetailsEventResponse', data);
  });

  client.on('messageSendEvent', data => {
    io.sockets.emit('messageSendEventResponse', data);
  });

  client.on('newGroupCreateEvent', data => {
    io.sockets.emit('newGroupCreateEventResponse', data);
  });

  client.on('groupMemberManageEvent', data => {
    io.sockets.emit('groupMemberManageEventResponse', data);
  });
  
  client.on('groupLeaveEvent', data => {
    io.sockets.emit('groupLeaveEventResponse', data);
  });
})

app.use(cors());
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: '100mb' }));

const api = require('./routes/api');
app.use('/api/', api);

server.listen(port, () => console.log(`CEO app listening at ${process.env.BASE_URL}`));