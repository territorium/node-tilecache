exports.makedir = function(path) {
	var callback = arguments[arguments.length - 1];
	// if (typeof(callback) !== 'function') callback = function(){};
	var spawn = require('child_process').spawn, mkdir = spawn('mkdir', [ '-p',
			path ]);
	mkdir.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});

	mkdir.stderr.on('data', function(data) {
		console.log('stderr: ' + data);
	});

	mkdir.on('exit', function(code) {
		return callback(code);
	});

}

exports.execmkdir = function(path) {
	var callback = arguments[arguments.length - 1];
	// if (typeof(callback) !== 'function') callback = function(){};
	var exec = require('child_process').exec;
	mkdir = exec('mkdir -p ' + path, function(error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
	});
	// mkdir.on('exit', function (error) {
	// return callback(code);

}