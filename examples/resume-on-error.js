"use strict";

var dq = require ("../lib");

dq.create ()
		.on ("error", function (error){
			console.error (error);
			
			//The queue pauses the execution when an error occurs
			//If you want to continue the execution, resume the queue
			this.resume ();
		})
		.push (function (){
			console.log (1);
		})
		.push (function (){
			throw new Error ("error");
		})
		.push (function (){
			console.log (2);
		});

/*
1
[Error: error]
2
*/