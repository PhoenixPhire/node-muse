var Myo = require('myo');
Myo.lockingPolicy = "none";
console.log()
Myo.connect('io.isobit.hello');
Myo.on('connected', function() {
	this.unlock();
});
Myo.on('fist', function(){
    console.log('Hello Myo!');
});
