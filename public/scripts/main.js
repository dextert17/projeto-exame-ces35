// Load the socket.io-client and then connect. 
// It defaults to trying to connect to the host that serves the page.
var socket = io();

// Get a typed message and send data message to server.
$('#send-message').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

$('#setNick').submit(function (e) {
  e.preventDefault();
  socket.emit('new user', $('#nickname').val(), function (data) {
    if (data) {
      $('#nickWrap').hide();
      $('#chat').show();
    } else {
      $('#nickError').html('That username is already taken! Try again.');
    }
  });
  $('#nickname').val('');
});

socket.on('usernames', function (data) {
  var html = '';
  for (i = 0; i < data.length; i++) {
    html += data[i] + '<br/>'
  }
  $('#users').html(html);
});

// When server call 'chat message', print in page.
socket.on('chat message', function (data){
  $('#messages').append($('<li>').html('<b>' + data.nickname + ': </b>' + data.msg));
});

// When server call 'stats', client receive data with numUsers and print in page.
socket.on('stats', function (data) {
  console.log('Connected users:', data.numUsers)
  $('#counter').html("Connected users: " + data.numUsers);
});

// Alert client when server shuts down
socket.on('disconnect', function () {
  alert('Failed to connect to server');
  // Alert client when server is back
  socket.on('connect', function() {
    alert('Server is back');
  })
});