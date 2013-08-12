"use strict";

var dq = require ("../lib");

dq.create ()
		.on ("error", function (error){
			//This function is never executed because preventDefault() was called
			console.error (error);
			this.resume ();
		})
		.push (function (cb){
			process.nextTick (function (){
				console.log (1);
				cb ();
			});
		})
		.push (function (cb){
			process.nextTick (function (){
				cb (new Error ("error"));
			});
		}, function (){
			//If this line is commented the default error handler is executed and
			//the queue is resumed, therefore, it prints:
			//1
			//[Error: error]
			//2
			this.preventDefault ();
		})
		.push (function (cb){
			process.nextTick (function (){
				console.log (2);
				cb ();
			});
		});

/*
1
*/