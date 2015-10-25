var io = require('socket.io')();
var osc = require('osc');

var udpPort = new osc.UDPPort({
	localAddress: "127.0.0.1",
	localPort: 5000
});
udpPort.open();

// average tracking here

var connections = [];
function emit(address, data) {
	for (var conn in connections) {
		if (conn.addresses.indexOf(data.address) != -1)
			conn.socket.emit(data.address, data);
	}
	// pseudo-address update code here
}

var lastPointTime = Date.now();
var now;
udpPort.on("message", function(data) {
	now = Date.now()
	if (now - lastPointTime < config.rate) return;
	emit(data.address, data);
});

io.on('connection', function(socket) {
	var id = connections.push({
		addresses: [],
		socket: socket
	});
	socket.on('subscribe', function(data) {
		console.log('subscribing to ' + data.addresses);
		for (var address in data.addresses)
			connections[id].addresses.push(address);
	});
	socket.on('disconnect', function () {
		console.log('disconnecting ' + id);
		connections.splice(id, 1);
	});
});
io.listen(8080);
