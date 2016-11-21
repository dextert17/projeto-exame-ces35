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

// Declare users counter and a nicknames vector.
var numUsers = 0;
var nicknames = [];

// Listen on the connection event for incoming sockets.
io.on('connection', function (socket){
	// When client call 'new user', verify if the nickname was alredy taken.
	socket.on('new user', function (data, callback) {
		if (nicknames.indexOf(data) != -1) {
			callback(false);
		} else {
			callback(true);
			// Define the nickname of the socket and put then on nicknames vector.
			socket.nickname = data;
			nicknames.push(socket.nickname);
			// Tell the client to execute 'usernames'.
			io.sockets.emit('usernames', nicknames);
		}
	});

	// Increase users counter and tell the client to execute 'stats'.
  numUsers++;
  io.emit('stats', { numUsers: numUsers });
  // Log connected sockets to the console.
  console.log('a user connected');
  console.log('Connected users:', numUsers);

  // When client emmit 'chat message', this listens and executes
  socket.on('chat message', function (data){
  	// Log chat message
  	console.log('message: ' + data);
  	// Brodcasting message, tell the client to execute 'chat message'
  	io.emit('chat message', {msg: data, nickname: socket.nickname});
 	});

 	// Listen on the disconnect event.
  socket.on('disconnect', function(){
  	if (!socket.nickname) return;
  	nicknames.splice(nicknames.indexOf(socket.nickname), 1);
  	io.sockets.emit('usernames', nicknames);
  	// Decrease users counter and tell the client to execute 'stats'.
  	numUsers--;
 	  io.emit('stats', { numUsers: numUsers });
 	  // Log that socket was closed.
 	  console.log('a user disconnected');
 	  console.log('Connected users:', numUsers);
  });

});

http.listen(3000, function (){
  console.log('listening on *:3000');
  console.log('Connected users:', numUsers);
});