var io = require('socket.io')();
var osc = require('osc');
var fs = require('fs');

//------ Load mock data streams ------
function loadDataStream(filename) {
	var name = filename.substr(0, filename.indexOf('.'));
	var testDataStream = fs.createReadStream(filename);
	testDataStream.setEncoding('utf8');
	testDataStream.on('readable', function() {
		var data = testDataStream.read();

		if (data) {
			data = data.replace('sampleDuration:', '');
			var sampleDuration = data.substr(0, data.indexOf('\n'));
			console.log("sample duration", sampleDuration);
			dataSequences[name] = {
				index: 0,
				sampleDuration: sampleDuration,
				data: parseNumericalData(data)
			};

			console.log("data \n \n " + dataSequences[name].data.length);
		}
	});
};

function parseNumericalData(data) {
	return data.split("\n");
};

function beginSequence(name) {
	if (!dataSequences[name]) {
		console.log("ERROR: could not find matching sequence");
		return;
	}
	onSequenceEvent(name);
};

function endSequence(name) {
	dataSequences[name].index = 0;
	emit(name, "Complete");
};

function onSequenceEvent(name) {
	var index = dataSequences[name].index;
	if ( index === dataSequence.length) {
		endSequence(name);
		return;
	}
	sendDataMessage(name, parseInt(dataSequences[name].data[index]));
	dataSequences[name].index++;
	setTimeout(function() {
		onSequenceEvent(name);
	}, dataSequences.sampleDuration);
};

function emit(channelName, data) {
	for (var conn in connections) {
		if (conn.channels.indexOf(channelName) != -1)
			conn.socket.emit(channelName, data);
	}
};

var connections = [];
var dataSequences = {};


// var udpPort = new osc.UDPPort({
// 	localAddress: "127.0.0.1",
// 	localPort: 5000
// });
// udpPort.open(); 

// udpPort.on("message", function(data) {
// 	now = Date.now()
// 	if (!lastMessageTime[data.address] || 
// 		now - lastMessageTime[data.address] < averagingRate) {
// 		return;
// 	}

// 	lastMessageTime[data.address] = now;
// 	averagingIndex[data.address]++;
// 	if (averagingIndex[data.address] == samplesPerWindow) {
// 		averagingIndex[data.address] = 0;
// 	}
// 	emit(data.address, data);
// });


io.on('connection', function(socket) {
	var id = connections.push({
		channels: [],
		socket: socket
	});
	socket.on('beginSequence', function(sequenceName) {
		console.log("beginning sequence", sequenceName);
		beginSequence(sequenceName);
	});
	socket.on('disconnect', function () {
		console.log('disconnecting ' + id);
		connections.splice(id - 1, 1);
	});


	// socket.on('subscribe', function(data) {
	// 	console.log('subscribing to ' + data.channels);
	// 	console.log('connections', connections);
	// 	for (var channel in data.channels)
	// 		connections[id - 1].channels.push(channel);
	// });
	
});
io.listen(8080);
resetAverageData();
loadDataStream('test.data');



//old stuff
//averaging index applies to all averaged data (currently limited to same refresh rate)
var averagingIndex = 0;
var averagingRate = 500;
var samplesPerWindow = 20;

var concentrationData;
var concentrationAverage;
var mellowData;
var mellowAverage;

var lastMessageTime = {};
var averagingIndex = {};
var now;


// average tracking
function calculateAverage(myArray) {
	var sum = 0;
	for (var i = 0; i < myArray.length; i++) {
		sum += myArray[i];
	}
	return sum / myArray.length;
};


function updateConcentrationData(data) {
	concentrationData[averagingIndex] = data;
	concentrationAverage = calculateAverage(concentrationData);
	emit("/muse/average/concentration");
};
function updateMellowData(data) {
	mellowData[averagingIndex] = data;
	mellowAverage = calculateAverage(mellowData);
	emit("/muse/average/mellow");
};

function resetAverageData() {
	concentrationData = [];
	mellowData = [];
	for (var i = 0; i < samplesPerWindow; i++) {
		concentrationData.push(0);
		mellowData.push(0);
	}
};