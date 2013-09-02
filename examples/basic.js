"use strict";

var dq = require ("../lib");

dq.create ()
		.on ("error", function (error){
			//This function is executed when any task fails
			//Here you typically log the error
			console.error (error);
		})
		.push (function (cb){
			//Asynchronous task
			process.nextTick (function (){
				//The first parameter is the error
				cb (null, 1, 2);
			});
		}, function (error, v1, v2){
			//This function is executed after the previous task and before the next
			//task
			//v1 is 1
			//v2 is 2
			console.log (v1, v2);
			
			//The queue is paused 1s
			this.pause ();
			var me = this;
			setTimeout (function (){
				me.resume ();
			}, 1000);
		})
		.push (function (){
			//Synchronous task
			return 5;
		}, function (error, v1){
			console.log (v1);
		})
		.unshift (function (cb){
			//The task is added to the beginning of the queue
			process.nextTick (function (){
				cb (null, 3, 4);
			});
		}, function (error, v1, v2){
			console.log (v1, v2);
		})
		.push (function (cb){
			process.nextTick (function (){
				cb (new Error ("error"));
			});
		}, function (error){
			//The error is first passed to this function and then is forwarded to the
			//error handler
			if (error){
				//Here you typically do clean up tasks
			}
		})
		.push (function (){
			//This task is never executed because the previous task returned an error,
			//the queue is automatically paused
		});

/*
1 2
3 4
5
[Error: error]
*/