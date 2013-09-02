"use strict";

var dq = require ("../lib");

var q = dq.create ();

(function push (i){
	q.push (function (){
		console.log (i);
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