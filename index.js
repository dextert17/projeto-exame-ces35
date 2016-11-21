var express = require('express');
var app = express();
var http = require('http').Server(app);

//Initialize a new instance of socket.io by passing the the HTTP server object.
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
});

// Listen on the connection event for incoming sockets.
io.on('connection', function (socket){
	// Log connected sockets to the console
  console.log('a user connected');
  socket.on('chat message', function (msg){
  	// Log chat message
  	console.log('message: ' + msg);
  	// Brodcasting message, send to everyone clients.
  	io.emit('chat message', msg);
 	});
 	// Listen on the disconnect event.
  socket.on('disconnect', function(){
  	// Log that socket was closed.
 	  console.log('a user disconnected');
  });
});

http.listen(3000, function (){
  console.log('listening on *:3000');
});