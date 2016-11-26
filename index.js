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
      // Tell the clients in same room to execute 'usernames'.
      nicksinroom = nicksInRoom(socket.room);
      io.in(socket.room).emit('usernames', nicksinroom);
      // Increase users counter and tell the client to execute 'stats'.
      numUsers++;
      // We want that the client show only the quantity of users in its room.
      roomUsers = nicksinroom.length;
      io.in(socket.room).emit('stats', { numUsers: roomUsers });
      // Log connected sockets to the console.
      console.log(socket.nickname + ' join in room ' + socket.room);
      // The server know the total of users.
      console.log('Connected users:', numUsers);
      // Tell only the client that enter to execute 'update rooms'.
      socket.emit('update rooms', { rooms: rooms, current_room: socket.room });
      // Alert clients in room that i'm in.
      socket.broadcast.in(socket.room).emit('enter in room', socket.nickname);
      // Tell to me that i join in room.
      socket.emit('I enter in room', socket.room);
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
      console.log('[ROOM ' + socket.room + '] ' + socket.nickname + ' public message: ' + msg);
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
    oldroom = socket.room;
    socket.room = newroom;
    // Log the room change.
    console.log(socket.nickname + ' leave room ' + oldroom);
    console.log(socket.nickname + ' join in room ' + newroom);
    // Atualize the users list for clients in old room in new room.
    nicksinroom = nicksInRoom(newroom);
    nicksinoldroom = nicksInRoom(oldroom);
    // Tell the clients in same room to execute 'usernames'.
    io.in(socket.room).emit('usernames', nicksinroom);
    // We want that the client show only the quantity of users in its room.
    roomUsers = nicksinroom.length;
    // Tell the clients in same room to execute 'stats'.
    io.in(socket.room).emit('stats', { numUsers: roomUsers });
    // Tell the clients in old room to execute 'usernames'.
    io.in(oldroom).emit('usernames', nicksinoldroom);
    // We want that the client show only the quantity of users in its room.
    roomUsers = nicksinoldroom.length;
    // Tell the clients in old room to execute 'stats'.
    io.in(oldroom).emit('stats', { numUsers: roomUsers });
    // Tell only the client has change to execute 'update rooms'.
    socket.emit('update rooms', { rooms: rooms, current_room: socket.room });
    // Alert clients in old room that i'm out.
    socket.broadcast.in(oldroom).emit('leave room', socket.nickname);
    // Tell to me that I leave room.
    socket.emit('I leave room', oldroom);
    // Alert clients in room that i'm in.
    socket.broadcast.in(socket.room).emit('enter in room', socket.nickname);
    // Tell to me that i join in room.
    socket.emit('I enter in room', socket.room);
  });

 	// Listen on the disconnect event.
  socket.on('disconnect', function(){
    // Don't do nothing if the user doesn't put nickname yet
  	if (!socket.nickname) return;
    // Remove the user from users and tell the client to execute 'usernames'
    delete users[socket.nickname];
    // Tell the clients in same room to execute 'usernames'.
    nicksinroom = nicksInRoom(socket.room);
  	io.in(socket.room).emit('usernames', nicksinroom);
  	// Decrease users counter and tell the client to execute 'stats'.
  	numUsers--;
    // We want that the client show only the quantity of users in its room.
    roomUsers = nicksinroom.length;
 	  io.in(socket.room).emit('stats', { numUsers: roomUsers });
    // Alert clients in room that i'm out.
    socket.broadcast.in(socket.room).emit('leave room', socket.nickname);
 	  // Log that socket was closed by the client.
    console.log(socket.nickname + ' leave room ' + socket.room);
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

// javaScript functions
function nicksInRoom (room) {
  // I want to send to the client only the usernames in same room.
  // The code above is for it.
  var aux = Object.keys(users);
  var nicksinroom = Object.keys(users);
  for (i = 0; i < aux.length; i++) {
    if (users[aux[i]].room !== room) {
      nicksinroom.splice(nicksinroom.indexOf(aux[i]), 1);
    }
  }
  return nicksinroom;
}