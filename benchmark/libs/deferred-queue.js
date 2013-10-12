"use strict";

module.exports = {
	module: require ("../../lib"),
	fn1: function (cb){
		cb (null, 1);
	},
	fn2: function (cb){
		cb (null, 2);
	},
	fn3: function (error, n){},
	fn4: function (error, n){},
	error: function (error){
		throw error;
	}
};