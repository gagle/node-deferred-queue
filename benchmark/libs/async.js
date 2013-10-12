"use strict";

/*
The deferred queue is similar to async.series(), async.waterfall(),
async.queue() and async.cargo() with concurrency 1 but there isn't a direct
port.
*/

module.exports = {
	module: require ("async"),
	series1: function (cb){
		cb (null, 1);
	},
	series2: function (cb){
		cb (null, 2);
	},
	seriesError:  function (error){
		throw error;
	},
	waterfall1: function (cb){
		cb (null, 1);
	},
	waterfall2: function (n, cb){
		cb (null, 2);
	},
	waterfallError:  function (error){
		throw error;
	},
	queue1: function (error){
		if (error) this.queueError (error);
	},
	queue2: function (error){
		if (error) this.queueError (error);
	},
	queue3: function (task, cb){
		cb ();
		if (task.cb) task.cb ();
	},
	queueError: function (error){
		throw error;
	},
	cargo1: function (error){
		if (error) this.cargoError (error);
	},
	cargo2: function (error){
		if (error) this.cargoError (error);
	},
	cargo3: function (task, cb){
		cb ();
		if (task[0].cb) task[0].cb ();
	},
	cargoError: function (error){
		throw error;
	}
};