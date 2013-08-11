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
			console.log (v1, v2);
			
			//The queue is paused during 1s
			this.pause ();
			var me = this;
			setTimeout (function (){
				me.resume ();
			}, 1000);
		})
		.push (function (cb){
			process.nextTick (function (){
				cb (null, 5, 6);
			});
		}, function (error, v1, v2){
			console.log (v1, v2);
		})
		.unshift (function (cb){
			//The task is added to the beginning of the array
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

/*
1 2
3 4
5 6
[Error: error]
*/