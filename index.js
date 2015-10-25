var io = require('socket.io')();
var osc = require('osc');

var nextId = 0;
var messageHandlers = [];
var udpPort = new osc.UDPPort({
	localAddress: "127.0.0.1",
	localPort: 5000
});
udpPort.open();
udpPort.on("message", function(data) {
	messageHandlers.forEach(function(f) {
		f(data);
	});
});

io.on('connection', function(socket) {
	var addresses = [];
	var config = {rate: 500};
	var lastPointTime = Date.now();
	var now;
    socket.on('subscribe', function(data) {
		console.log('subscribing to ' + data.address);
		addresses.push(data.address);
    });
    socket.on('config', function(data) {
		console.log('setting config to' + JSON.stringify(data));
		config = data;
    });

	var id = messageHandlers.push(function(data){
		now = Date.now()
		if (now - lastPointTime > config.rate) {
			if (addresses.indexOf(data.address) == -1) return;
			lastPointTime = now;
			socket.emit(data.address, data); 
		}
	})
	socket.on('disconnect', function () {
		messageHandlers.splice(id, 1);
	});
});
io.listen(8080);
