// Load the socket.io-client and then connect. 
// It defaults to trying to connect to the host that serves the page.
var socket = io();

// Get a typed message and send to server.
$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

// When server call 'chat message', print in page.
socket.on('chat message', function (msg){
  $('#messages').append($('<li>').text(msg));
});

// When server call 'stats'.
socket.on('stats', function (data) {
  console.log('Conected users:', data.numUsers)
});