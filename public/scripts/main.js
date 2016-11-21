// Load the socket.io-client and then connect. 
// It defaults to trying to connect to the host that serves the page.
var socket = io();

// Get a typed username and send data message to server.
$('#setNick').submit(function (e) {
  e.preventDefault();
  // Tell the server to execute 'new user'.
  socket.emit('new user', $('#nickname').val(), function (data) {
    // data is a nickname, if the nickname was not taken.
    if (data) {
      $('#nickWrap').hide();
      $('#chat').show();
    } else {
      $('#nickError').html('That username is already taken! Try again.');
    }
  });
  $('#nickname').val('');
});

// When server call 'usernames', update the usernames listed in page.
socket.on('usernames', function (data) {
  // data is a vector with all usernames.
  var html = '';
  for (i = 0; i < data.length; i++) {
    html += data[i] + '<br/>'
  }
  $('#users').html(html);
});

// When server call 'stats', client receive data with numUsers and print in page.
socket.on('stats', function (data) {
  console.log('Connected users:', data.numUsers)
  $('#counter').html("Connected users: " + data.numUsers);
});

// Get a typed message and send data message to server.
$('#send-message').submit(function(){
  // Tell the server to execute 'chat message'.
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

// When server call 'chat message', print in page.
socket.on('chat message', function (data){
  $('#messages').append($('<li>').html('<b>' + data.nickname + ': </b>' + data.msg));
});

// Alert client when server shuts down
socket.on('disconnect', function () {
  alert('Failed to connect to server');
  // Alert client when server is back
  socket.on('connect', function() {
    alert('Server is back');
  })
});