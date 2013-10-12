"use strict";

module.exports = {
	module: require ("step"),
	fn1: function (){
		fn3 (1, this);
	},
	fn2: function (error, n){
		if (error) throw error;
		fn3 (2, this);
	},
	fn3: function (n, cb){
		cb (null, n);
	},
	error: function (error){
		throw error;
	}
};

var fn3 = module.exports.fn3;