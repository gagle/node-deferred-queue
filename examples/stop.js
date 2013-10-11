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
			console.log (2);
		}, function (){
			this.stop ();
		})
		.push (function (){
			console.log (3);
		})
		.push (function (){
			console.log (4);
		});

/*
1
2
*/