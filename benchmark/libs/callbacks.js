"use strict";

var fn1 = function (cb){
	cb (null, 1);
};

var fn2 = function (cb){
	cb (null, 2);
};

var err = function (error){
	throw error;
};

module.exports.module = function (cb){
	fn1 (function (error, n){
		if (error) return err (error);
		fn2 (function (error, n){
			if (error) return err (error);
			cb ();
		});
	});
};