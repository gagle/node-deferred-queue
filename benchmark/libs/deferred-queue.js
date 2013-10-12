"use strict";

module.exports = {
	module: require ("../../lib"),
	sync1: function (){
		return 1;
	},
	sync2: function (){
		return 2;
	},
	async1: function (cb){
		cb (null, 1);
	},
	async2: function (cb){
		cb (null, 2);
	},
	fn3: function (error, n){},
	fn4: function (error, n){},
	error: function (error){
		throw error;
	}
};