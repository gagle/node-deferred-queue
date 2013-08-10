"use strict";

var dq = require ("../lib");

var q = dq.create ();
var again = true;

q.on ("error", function (error){
	console.error (error);
});

q.push (function (cb){
	process.nextTick (function (){
		console.log (1);
		cb ();
	});
});

q.push (function (cb){
	process.nextTick (function (){
		console.log (2);
		cb ();
	});
}, function (){
	q.pause ();
	setTimeout (function (){
		q.resume ();
	}, 1000);
});

q.push (function (cb){
	process.nextTick (function (){
		console.log (3);
		if (again){
			again = false;
			cb (null, "again");
		}else{
			cb (new Error ("error"));
		}
	});
}, function (error, msg){
	if (!error){
		console.log (msg);
		q.restart ();
	}
});

q.push (function (cb){
	//Never executes
	//The first iteration because the queue is restarted and the second because
	//the previous task returns an error and the queue is paused
	process.nextTick (function (){
		console.log (4);
	});
});

/*
1
2
(1000ms delay)
3
again
1
2
(1000ms delay)
3
something went wrong: error
*/