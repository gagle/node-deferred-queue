"use strict";

var fn1 = function (cb){
	cb (null, 1);
};

var fn2 = function (cb){
	cb (null, 2);
};

module.exports = {
	module: require ("bluebird"),
	makePromiseFn1: function (){
		var resolver = module.exports.module.pending ();
		fn1 (function (error, n){
			if (error){
				resolver.reject (error);
			}else{
				resolver.fulfill (n);
			}
		});
		return resolver.promise;
	},
	makePromiseFn2: function (){
		var resolver = module.exports.module.pending ();
		fn2 (function (error, n){
			if (error){
				resolver.reject (error);
			}else{
				resolver.fulfill (n);
			}
		});
		return resolver.promise;
	},
	fn1: function (n){
		return module.exports.makePromiseFn2 ();
	},
	fn2: function (n){},
	error: function (error){
		throw error;
	}
};