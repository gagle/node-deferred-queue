var dq = require ("../lib");
var fs = require ("fs");

dq ()
		.on ("error", function (error){
			console.log (error);
		})
		.push (function (cb){
			fs.readFile (__filename, cb);
		}, function (error, buffer){
			if (!error) console.log ("size: " + buffer.length);
		})
		.push (function (cb){
			fs.stat (__filename, cb);
		}, function (error, stats){
			if (!error) console.log ("atime: " + stats.atime);
		});
		//Warning! fs.exists cannot be used because despite being asynchronous it
		//doesn't return any error, when the first parameter is always considered
		//an error
		/*.push (function (cb){
			fs.exists (__filename, cb);
		}, function (exists){
			console.log ("exists: " + exists);
		});*/