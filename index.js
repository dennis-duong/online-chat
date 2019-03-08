var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var date = new Date();

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html'); //serves the html file to client
});

io.on('connection', function(socket){ //listen for connection event
	var nickname = "Bob";

	var info = new Object();
	info.nickname = getNickName();
	info.colour = getColour();

	io.emit('connection message', nickname + " has connected.")
	console.log('a user connected');

	socket.on('disconnect', function(){ //listen for disconnect event
		io.emit('connection message', nickname + " has disconnected.")
		console.log('user disconnected');
	});

	socket.on('chat message', function(msg){
		var currentTime = getTime();

		io.emit('chat message', currentTime + " " + nickname + ": " + msg); //send message to all clients
		console.log('message: ' + currentTime + " " + nickname + ": " + msg);
	});
});

http.listen(3000, function(){
	console.log('listening on port: 3000');
});

function getTime() {
	var currentHour = date.getHours() < 10 ? '0'+ date.getHours() : date.getHours();
	var currentMinute = date.getMinutes() < 10 ? '0'+ date.getMinutes() : date.getMinutes(); //formatting
	var currentTime = currentHour + ":" + currentMinute;
	return currentTime;
}

function getNickname() {
	var names = []

}