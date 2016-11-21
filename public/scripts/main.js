// Load the socket.io-client and then connect. 
// It defaults to trying to connect to the host that serves the page.
var socket = io();

// Get a typed message and send data message to server.
$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

// When server call 'chat message', print in page.
socket.on('chat message', function (msg){
  $('#messages').append($('<li>').text(msg));
});

// When server call 'stats', client receive data with numUsers and print in page.
socket.on('stats', function (data) {
  console.log('Connected users:', data.numUsers)
  $('#counter').html("Connected users: " + data.numUsers);
});

// Alert client when server shuts down
socket.on('disconnect', function () {
  alert('Failed to connect to server');
});