var fs = require('fs');
var prompt = require('prompt');

var file = fs.createWriteStream(process.argv[2]);
file.on('error', function(err) { 
	console.log("error writing to file");
 });

var samplingRate, totalTime, 
	startValue, endValue, 
	noiseMean, noiseDeviation;

prompt.start();
prompt.get(['samplingRate', 'totalTime', 'startValue', 'endValue', 'noiseMean', 'noiseDeviation'], 
	function(error, result) {

		samplingRate = parseInt(result.samplingRate);
		totalTime = parseInt(result.totalTime);
		startValue = parseInt(result.startValue);
		endValue = parseInt(result.endValue);
		noiseMean = parseInt(result.noiseMean);
		noiseDeviation = parseInt(result.noiseDeviation);

		var numSamples = totalTime * samplingRate;
		var sampleDuration = 1000 / samplingRate;
		var dataArray = [];

		for (var i = 0; i < numSamples; i++ ) {
			var t = sampleDuration * i;
			
			var dataPoint = startValue + (i / (numSamples - 1)) * (endValue - startValue);
			var noise = noiseMean + Math.random() * noiseDeviation;
			dataPoint += noise;
			file.write(t.toString() + ", " + dataPoint + ",\n");
		}
		file.end();
	});

