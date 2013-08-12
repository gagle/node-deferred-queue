"use strict";

var dq = require ("../lib");

//If you don't need to perform clean up tasks when a task fails, you can hide
//the error. The api.js example also does this.

var q = dq.create ();
var push = q.constructor.prototype.push;

q.constructor.prototype.push = function (task, cb){
	//Call the original push function with a custom callback
	push.call (this, task, function (error){
		if (!error && cb){
			var args = Array.prototype.slice.call (arguments);
			args.shift ();
			cb.apply (this, args);
		}
	});
};

q.push (function (cb){
	cb (null, 1);
}, function (v1){
	console.log (v1);
});