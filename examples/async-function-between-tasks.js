"use strict";

var dq = require ("../lib");

var async = function (cb){
	process.nextTick (cb);
};

dq ()
		.on ("error", function (error){
			console.error (error);
		})
		.push (function (){
			console.log (1);
		}, function (error, cb){
			async (function (error){
				if (error) return cb (error);
				
				console.log (2);
				
				cb ();
			});
		})
		.push (function (){
			console.log (3);
		});

/*
1
2
3
*/