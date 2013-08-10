"use strict";

var dq = require ("../lib");

dq.create ()
		.on ("error", function (error){
			//This function is executed when any task fails
			//Here you typically want to log the error
			console.error (error);
		})
		.push (function (cb){
			//Simuates an asynchronous task
			process.nextTick (function (){
				//The first parameter is the error
				cb (null, 1, 2);
			});
		}, function (error, v1, v2){
			//This function is executed with the result of the task
			//v1 is 1
			//v2 is 2
		})
		.push (function (cb){
			//Simuates an asynchronous task
			process.nextTick (function (){
				cb (new Error ("error"));
			});
		}, function (error){
			//The error is first passed to this function and then is emitted to the
			//error handler
			//Here you typically want to check if an error occurred and perform some
			//clean up tasks
			if (error){
				//...
			}
		})
		.push (function (){
			//This task is never executed because the previous task returned an error,
			//the queue is automatically paused
		});