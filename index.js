var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var nicknameList = ['John', 'Bob', 'Robert', 'Jane', 'Eve', 'Alice', 'Jim', 'Michael', 'Susan', 'Jennifer', 'Paul', 'Dan', 'Dennis', 'Alex', 'Jason', 'Cindy', 'Vivian', 'James', 'Steven', 'Christina', 'Larry', 'Mark', 'Adam', 'Lisa', 'Julie', 'Tony'];
var usedNicknames = [];
var savedNicknames = [];

var chatLogs = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html'); //serves the html file to client
});


io.on('connection', function(socket){ //listen for connection event

	var cookies = socket.client.request.headers.cookie;
	//console.log(cookies);
	var cookieList = cookies && cookies.split(';');
	//console.log(cookieList);
	var nickCookie = cookieList && cookieList.find(function(cookie) {
		return cookie.includes("nickCookie=");
	});
	console.log(nickCookie);
	var nickname = nickCookie?getSavedNickname(nickCookie.split('=')[1]):getNewNickname();

	console.log(nickname);
	var color = "ff0000";
	var user = new Object();

	user.nickname = nickname;
	user.color = color;


	socket.emit('nickname assignment', user); //send given nickname

	socket.emit('chat history', chatLogs); //sending chat history array to client

	io.emit('online users', usedNicknames); //sending list of online users to client

	var user = new Object();
	user.nickname = nickname;
	user.color = color;
	user.time = getTime();
	user.msg = "has connected.";
	io.emit('connection message', user); //sending the connection msg
	chatLogs.push(user); //logging message
	console.log(chatLogs);

	socket.on('disconnect', function(){ //listen for disconnect event
		var user = new Object();
		user.nickname = nickname;
		user.color = color;
		user.time = getTime();
		user.msg = "has disconnected.";
		io.emit('connection message', user);

		chatLogs.push(user); //logging message
		console.log(chatLogs);

		saveNickname(user.nickname);
		io.emit('online users', usedNicknames); //update online users to client
	});

	socket.on('chat message', function(msg){
		var user = new Object();
		user.nickname = nickname;
		user.color = color;
		user.time = getTime();
		user.msg = msg;
		io.emit('chat message', user);
		
		chatLogs.push(user); //logging message
		console.log(chatLogs);

	});

	socket.on('nick command', function(msg) {
		if(checkNickname(msg)) {
			socket.emit("info message", "This nickname is in use or is saved by another user.");
		} else {
			returnNickname(nickname);
			nickname = msg;
			var user = new Object();
			user.nickname = nickname;
			user.color = color;
			usedNicknames.push(nickname);
			socket.emit('nickname assignment', user);
			socket.emit("info message", `Nickname changed to ${msg}`);
			io.emit('online users', usedNicknames);
		}
	});

	socket.on('color command', function(msg) {
		color = msg;
		var user = new Object();
		user.nickname = nickname;
		user.color = color;
		socket.emit('nickname assignment', user);
		socket.emit("info message", `Nickname color changed to #${msg}`);
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

function getNewNickname() {
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

function checkNickname(nickname) {
	var exists = usedNicknames.indexOf(nickname) !== -1? true: false;
	var isSaved = savedNicknames.indexOf(nickname) !== -1? true: false;
	if(exists||isSaved) {
		return true
	}
	return false;
}

function saveNickname(nickname) {
	savedNicknames.push(nickname);
	var pos = usedNicknames.indexOf(nickname);
	usedNicknames.splice(pos, 1);
}

function getSavedNickname(nickCookie) {
	usedNicknames.push(nickCookie);		
	var pos = savedNicknames.indexOf(nickCookie);
	savedNicknames.splice(pos,1);
	return nickCookie;
}