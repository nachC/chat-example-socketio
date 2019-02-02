const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);


let users = []; //holds the online users

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('user connected');
    let username = `user ${Math.floor(Math.random() * 10000)}`; //sets a random username upon connecting
    users.push(username);

    socket.emit('set username', { username }); //emits 'set username' event to the client
    socket.broadcast.emit('user connected'); //sent to all users but the sender
    io.emit('users online', { usersOnline: users}); //emits object with array of users online to all clients

    socket.on('chat message', (data) => {
        socket.broadcast.emit('chat message', data); //emits chat message data to all clients but the sender
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        let userDisconnected = users.splice(users.indexOf(username), 1); //remove disconnected user from array
        socket.broadcast.emit('user disconnected', userDisconnected[0]); //emit event passing user that dc'd
    });

    socket.on('user typing', (isTyping) => {
        console.log('user typing', isTyping);
        socket.broadcast.emit('user typing', isTyping); //emits event to let other users know that this client is typing a message
    });
})

http.listen(3000, function () {
    console.log('listening on port 3000');
});