"use strict";

var dq = require ("../lib");

var q = dq ();

(function push (i){
	q.push (function (){
		console.log (i);
	}, function (){
		setTimeout (function (){
			push (i + 1);
		}, 1000);
	});
})(0);

/*
0
1
2
3
...
*/