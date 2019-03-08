var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var nicknameList = ['John', 'Bob', 'Robert', 'Jane', 'Eve', 'Alice'];
var usedNicknames = [];

var chatLogs = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html'); //serves the html file to client
});

io.on('connection', function(socket){ //listen for connection event

	var user = new Object();
	user.nickname = getNickname();
	user.color = "red";

	socket.emit('chat history', chatLogs); //sending chat history array to client

	var connectionMsg = `<b><span style="color: ${user.color};">${user.nickname}</span></b> has connected.`;
	io.emit('connection message', connectionMsg); //
	io.emit('online users', usedNicknames);
	chatLogs.push(connectionMsg);
	console.log(chatLogs);

	socket.on('disconnect', function(){ //listen for disconnect event
		var disconnectionMsg = `<b><span style="color: ${user.color};">${user.nickname}</span></b> has disconnected.`;
		io.emit('connection message', disconnectionMsg);
		chatLogs.push(disconnectionMsg);
		console.log(chatLogs);
		returnNickname(user.nickname);
		io.emit('online users', usedNicknames);
	});

	socket.on('chat message', function(msg){
		user.msg = msg;
		chatLogs.push(formatMsg(user));
		io.emit('chat message', formatMsg(user));
		console.log(chatLogs);

	});
});

http.listen(3000, function(){
	console.log('listening on port: 3000');
});

function getTime() {
	var date = new Date();
	var currentHour = date.getHours() < 10 ? '0'+ date.getHours() : date.getHours();
	var currentMinute = date.getMinutes() < 10 ? '0'+ date.getMinutes() : date.getMinutes(); //formatting
	var currentTime = currentHour + ":" + currentMinute;
	return currentTime;
}

function getNickname() {
	var nickname = "defaultName";
	if (nicknameList.length>0) {
		nickname = nicknameList.shift();
		usedNicknames.push(nickname);
	} 
	return nickname;
}

function returnNickname(nickname) {
	nicknameList.push(nickname);
	var pos = usedNicknames.indexOf(nickname);
	usedNicknames.splice(pos, 1);
}

function formatMsg(user) {
	var msg = `${getTime()} <b><span style="color: ${user.color};">${user.nickname}</span></b>: ${user.msg}`;
	return msg;
}