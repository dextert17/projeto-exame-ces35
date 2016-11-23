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

// Declare users counter and a users object.
var numUsers = 0;
var users = {};
// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

// Listen on the connection event for incoming sockets.
io.on('connection', function (socket){
	// When client call 'new user', verify if the nickname was alredy taken.
	socket.on('new user', function (data, callback) {
		if (data in users || data === '') {
			callback(false);
		} else {
			callback(true);
			// Define the nickname of the socket and put then on users.
			socket.nickname = data;
      users[socket.nickname] = socket;
      // store the room name in the socket session for this client.
      socket.room = 'room1';
      // send client to room 1
      socket.join('room1');
      // Tell the client to execute 'usernames'.
      io.sockets.emit('usernames', Object.keys(users));
      // Increase users counter and tell the client to execute 'stats'.
      numUsers++;
      io.emit('stats', { numUsers: numUsers });
      // Log connected sockets to the console.
      console.log(socket.nickname + ' connected');
      console.log('Connected users:', numUsers);
      // Tell the client to execute 'update rooms'
      socket.emit('update rooms', rooms, 'room1');
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

  socket.on('switch room', function (newroom) {
    // leave the current room (stored in session)
    socket.leave(socket.room);
    // join new room, received as function parameter
    socket.join(newroom);
    // update socket session room title
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
  	io.sockets.emit('usernames', Object.keys(users));
    // Remove the socket from the room
    socket.leave(socket.room);
  	// Decrease users counter and tell the client to execute 'stats'.
  	numUsers--;
 	  io.emit('stats', { numUsers: numUsers });
 	  // Log that socket was closed by the client.
 	  console.log(socket.nickname + ' disconnected');
 	  console.log('Connected users:', numUsers);
  });

});

http.listen(3000, function (){
  console.log('listening on *:3000');
  console.log('Connected users:', numUsers);
});