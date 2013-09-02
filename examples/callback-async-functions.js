"use strict";

var dq = require ("../lib");

var foo = function (cb){
	process.nextTick (cb);
};

dq.create ()
		.on ("error", function (error){
			console.error (error);
		})
		.push (function (){
			console.log (1);
		}, function (error, v1){
			//Since this callback doesn't have any error handling mechanism, ie.
			//cannot pass an error to a cb parameter, if you want to execute an
			//asynchronous function between 2 tasks, you have to pause the queue
			//and when the function returns resume it again
			this.pause ();
			
			var me = this;
			foo (function (error){
				//If an error occurs you typically want to stop the queue and let the
				//virtual machine to garbage collect it
				//It was paused before so the queue is already stopped
				if (error) return console.error (error);
				
				console.log (2);
				
				//If no error proceed
				me.resume ();
			});
		})
		.push (function (){
			console.log (3);
		});

/*
1
2
3
*/