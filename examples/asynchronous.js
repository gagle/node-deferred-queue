"use strict";

var dq = require ("../lib");

var q = dq.create ()
		.on ("error", function (error){
			console.error (error);
		})
		.push (function (cb){
			process.nextTick (function (){
				console.log (1);
				cb()
			});
		})
		.push (function (){
			q.push (function (cb){
				process.nextTick (function (){
					console.log (3);
					cb()
				});
			})
			.push (function (cb){
				process.nextTick (function (){
					console.log (4);
					cb()
				});
			})
		})
		.push (function (cb){
			process.nextTick (function (){
				console.log (2);
				cb()
			});
		});

/*
1
2
3
4
*/