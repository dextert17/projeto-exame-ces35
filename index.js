// Setup basic express server
var express = require('express');
var app = express();
var http = require('http').Server(app);

//Initialize a new instance of socket.io by passing the the HTTP server object.
var io = require('socket.io')(http);

// Routing
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
});

// Declare total users counter and a users object.
var numUsers = 0;
var users = {};
// Rooms which are currently available in chat.
var rooms = ['Dijkstra','Turing','Rejewski'];

// Listen on the connection event for incoming sockets.
io.on('connection', function (socket){
	// When client call 'new user', verify if the nickname was alredy taken.
	socket.on('new user', function (data, callback) {
		if (data.nickname in users || data.nickname === '') {
			callback(false);
		} else {
			callback(true);
			// Define the nickname of the socket and put then on users.
			socket.nickname = data.nickname;
      users[socket.nickname] = socket;
      // Store the room name in the socket session for this client.
      socket.room = data.room;
      // Send client to its room.
      socket.join(socket.room);
      // I want to send to the client only the usernames in same room.
      // The code above is for it.
      var aux = Object.keys(users);
      var nicksinroom = Object.keys(users);
      for (i = 0; i < aux.length; i++) {
        if (users[aux[i]].room !== socket.room) {
          nicksinroom.splice(nicksinroom.indexOf(aux[i]), 1);
        }
      }
      // Tell the clients in same room to execute 'usernames'.
      io.in(socket.room).emit('usernames', nicksinroom);
      // Increase users counter and tell the client to execute 'stats'.
      numUsers++;
      // We want that the client show only the quantity of users in its room.
      roomUsers = nicksinroom.length;
      io.in(socket.room).emit('stats', { numUsers: roomUsers });
      // Log connected sockets to the console.
      console.log(socket.nickname + ' connected');
      // The server know the total of users.
      console.log('Connected users:', numUsers);
      // Tell the client to execute 'update rooms'
      socket.emit('update rooms', rooms, socket.room);
		}
	});

  // When client emmit 'chat message', this listens and executes.
  socket.on('chat message', function (data, callback){
  	// Remove whitespace from both sides of data message.
    var msg = data.trim();
    // Verify if it is a private message.
    if(msg.substr(0,3) === '/w ' || msg.substr(0,3) === '\\w ') {
      // Remove the code of private message.
      msg = msg.substr(3);
      var aux = msg.indexOf(' ');
      // Verify if data has a message to send.
      if (aux !== -1) {
        // Take the name of destination.
        var name = msg.substr(0, aux);
        // Take only the message.
        var msg = msg.substring(aux + 1);
        // Verify if the user is in chat.
        if (name in users) {
          // Log the private message
          console.log(socket.nickname + ' private message to ' + name + ': ' + msg);
          // Send the message, tell only the target client to execute 'private message'.
          users[name].emit('private message', {msg: msg, nickname: socket.nickname});
          // Verify if i'm not my target.
          if (name !== socket.nickname) {
            // Now tell the sender client to execute 'my private message'.
            socket.emit('my private message', {msg: msg, nickname: socket.nickname, target: name});
          }
        } else {
          // Message in case of the user ins not in chat.
          callback('Error! Enter a valid user.');
        }
      } else {
        // Message in case of don't have a message to send.
        callback('Error! Please enter a message for your whisper.');
      }
    } else {
      // Log the message
      console.log(socket.nickname + ' public message: ' + msg);
  	  // Brodcasting message, tell all clients to execute 'chat message'.
  	  io.in(socket.room).emit('chat message', {msg: msg, nickname: socket.nickname});
    }
 	});

  // When client emmit 'switch room', this listens and executes.
  socket.on('switch room', function (newroom) {
    // Leave the current room (stored in session).
    socket.leave(socket.room);
    // Join new room, received as function parameter.
    socket.join(newroom);
    // Update socket session room title.
    socket.room = newroom;
    // Tell the client to execute 'update rooms'.
    socket.emit('update rooms', rooms, newroom);
  });

 	// Listen on the disconnect event.
  socket.on('disconnect', function(){
    // Don't do nothing if the user doesn't put nickname yet
  	if (!socket.nickname) return;
    // Remove the user from users and tell the client to execute 'usernames'
    delete users[socket.nickname];
    // I want to send to the client only the usernames in same room.
    // The code above is for it.
    var aux = Object.keys(users);
    var nicksinroom = Object.keys(users);
    for (i = 0; i < aux.length; i++) {
      if (users[aux[i]].room !== socket.room) {
        nicksinroom.splice(nicksinroom.indexOf(aux[i]), 1);
      }
    }
    // Tell the clients in same room to execute 'usernames'.
  	io.in(socket.room).emit('usernames', nicksinroom);
  	// Decrease users counter and tell the client to execute 'stats'.
  	numUsers--;
    // We want that the client show only the quantity of users in its room.
    roomUsers = nicksinroom.length;
 	  io.in(socket.room).emit('stats', { numUsers: roomUsers });
 	  // Log that socket was closed by the client.
 	  console.log(socket.nickname + ' disconnected');
    // The server know the total of users.
 	  console.log('Connected users:', numUsers);
    // Remove the socket from the room.
    socket.leave(socket.room);
  });

});

http.listen(3000, function (){
  console.log('listening on *:3000');
  console.log('Connected users:', numUsers);
});