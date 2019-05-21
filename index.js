var app = require('express')();
var hmm = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use("/resources", hmm.static(__dirname + "/resources"));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('an user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    io.emit('disconnect', "msg");
  });
  socket.on('move made', function(msg){
    // io.emit('move made', msg); // sends cords
    socket.broadcast.emit('move made', msg);
  });
  socket.on('choice', function(msg){
    // io.emit('move made', msg); // sends cords
    socket.broadcast.emit('choice', msg);
  });
  socket.on('win', function(msg){
    io.emit('win', msg); // sends cords
    // socket.broadcast.emit('win', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
