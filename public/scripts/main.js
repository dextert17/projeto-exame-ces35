// Load the socket.io-client and then connect. 
// It defaults to trying to connect to the host that serves the page.
var socket = io();

// Get a typed username and send data message to server.
$('#setInfos').submit(function (e) {
  e.preventDefault();
  var nickname = $('#nickField').val();
  var room = '';
  room = '\'' + $('input[name=room]:checked').val() + '\'';
  // Tell the server to execute 'new user'.
  socket.emit('new user', { nickname: nickname, room: room }, function (data) {
    // data is a nickname, if the nickname was not taken or was not empty.
    if (data) {
      // If everything is ok, show chat room.
      $('#nickWrap').hide();
      $('#chatWrap').show();
    } else {
      $('#nickField').css("border", "1px solid red");
      // Verify if it's a empty nickname.
      if (nickname === '') {
        $('#nickError').html('Please, enter a nickname');
      } else { // Os if it's a alredy used nickname.
        $('#nickError').html('That nickname is already taken! Try again.');
      }
    }
  });
  $('#nickField').val('');
});

// Get a typed message and send data message to server.
$('#send-message').submit(function(){
  // Tell the server to execute 'chat message'.
  socket.emit('chat message', $('#m').val(), function (data) {
    // If was a message with Error, the server will return this.
    $('#messages').append($('<li>').html('<span class="error"><b>' + data + '</b></span>'));
  });
  $('#m').val('');
  return false;
});

// When server call 'usernames', update the usernames listed in page.
socket.on('usernames', function (data) {
  // data is a vector with all usernames.
  var html = '';
  for (i = 0; i < data.length; i++) {
    html += '<span id="text-selector" onclick="privateMessage($(this).text())">' + data[i] + '</span>'
  }
  $('#users').html(html);
});

// When server call 'stats', client receive data with numUsers and print in page.
socket.on('stats', function (data) {
  console.log('Connected users:', data.numUsers)
  $('#counter').html("Connected users: " + data.numUsers);
});

// When server call 'chat message', print in page.
socket.on('chat message', function (data) {
  $('#messages').append($('<li>').html('<b>' + data.nickname + ': </b>' + data.msg));
});

// When server call 'private message', print just for destination.
socket.on('private message', function (data) {
  $('#messages').append($('<li>').html('<b>' + data.nickname + '</b><i> (private)</i><b>: </b>' + data.msg));
});

// When server call 'my private message', print just for me.
socket.on('my private message', function (data) {
  $('#messages').append($('<li>').html('<b>' + data.nickname + '</b><i> (private to ' + data.target + ')</i><b>: </b>' + data.msg));
});

// When server call update rooms.
socket.on('update rooms', function (data) {
  // Atualize the room title.
  $('#room').html(
        '<h1><img src="/images/Brasao_ITA_cmyk.gif" alt="Instituto Tecnológico de Aeronáutica"></img>ITA Chat - Room: '
        + data.current_room
        + '</h1>');
  // Atualize the rooms list.
  $('#rooms').empty();
  $.each(data.rooms, function (key, value) {
    roomName = '\'' + value + '\'';
    if(roomName == data.current_room) {
      $('#rooms').append('<span style="width: 100%; display: block; padding: 5px;"><b>' + value + '</b></span>');
    }
    else {
      $('#rooms').append('<span id="text-selector" onclick="switchRoom($(this).text())">' + value + '</span>');
    }
  });
});

// When server call 'enter in room', print just for destination.
socket.on('enter in room', function (data) {
  $('#messages').append($('<li>').html('<span class="alert"><i><b>' + data + '</b> join in room</i></span>'));
});

// When server call 'I enter in room', print just for destination.
socket.on('I enter in room', function (data) {
  $('#messages').append($('<li>').html('<span class="alert"><i>You join in room <b>' + data + '</b></i></span>'));
});

// When server call 'leave room', print just for destination.
socket.on('leave room', function (data) {
  $('#messages').append($('<li>').html('<span class="alert"><i><b>' + data + '</b> leave room</i></span>'));
});

// When server call 'I leave room', print just for destination.
socket.on('I leave room', function (data) {
  $('#messages').append($('<li>').html('<span class="alert"><i>You leave room <b>' + data + '</b></i></span>'));
});

// Alert client when server shuts down.
socket.on('disconnect', function () {
  alert('Failed to connect to server');
  // Alert client when server is back.
  socket.on('connect', function() {
    alert('Server is back');
  })
});

// javaScript functions
function privateMessage (data) {
  $('#m').val('/w ' + data + ' ');
}

function switchRoom (room) {
  room = '\'' + room + '\'';
  socket.emit('switch room', room);
}