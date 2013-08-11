"use strict";

var dq = require ("../lib");

var q = dq.create ();
q
		.on ("error", function (error){
			console.error (error);
		})
		.push (function (){
			console.log (1);
		})
		.push (function (){
			q.push (function (){
				console.log (3);
			})
			.push (function (){
				console.log (4);
			})
		})
		.push (function (){
			console.log (2);
		});

/*
1
3
4
2
*/