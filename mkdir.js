exports.makedir = function (path){
var callback = arguments[arguments.length - 1];
//if (typeof(callback) !== 'function') callback = function(){};
var spawn = require('child_process').spawn,
    mkdir = spawn('mkdir', ['-p', '-v', path]);
    mkdir.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

mkdir.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

mkdir.on('exit', function (code) {
  console.log('child process exited with code ' + code);
  return callback(code);
});

}