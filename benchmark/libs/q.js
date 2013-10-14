"use strict";

var fn1 = function (cb){
	cb (null, 1);
};

var fn2 = function (cb){
	cb (null, 2);
};

module.exports = {
	module: require ("q"),
	makePromiseFn1: function (){
		var deferred = module.exports.module.defer ();
		fn1 (function (error, n){
			if (error){
				deferred.reject (error);
			}else{
				deferred.resolve (n);
			}
		});
		return deferred.promise;
	},
	makePromiseFn2: function (){
		var deferred = module.exports.module.defer ();
		fn2 (function (error, n){
			if (error){
				deferred.reject (error);
			}else{
				deferred.resolve (n);
			}
		});
		return deferred.promise;
	},
	fn1: function (n){
		return module.exports.makePromiseFn2 ();
	},
	fn2: function (n){},
	error: function (error){
		throw error;
	}
};