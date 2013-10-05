"use strict";

var dq = require ("../lib");

dq ()
		.on ("error", function (error){
			console.error (error);
		})
		.push (function (){
			console.log (1);
		})
		.push (function (){
			this.push (function (){
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