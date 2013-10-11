"use strict";

/*
The deferred queue is similar to async.series(), async.waterfall() and
async.queue() and async.cargo() with concurrency 1 but there isn't a direct
port.
*/

var speedy = require ("speedy");
var async = require ("async");
var dq = require ("../lib");

var asyncSeries1 = function (cb){
	cb (null, 1);
};
var asyncSeries2 = function (cb){
	cb (null, 2);
};
var asyncSeriesError = function (error){
	throw error;
};

var asyncWaterfall1 = function (cb){
	cb (null, 1);
};
var asyncWaterfall2 = function (n, cb){
	cb (null, 2);
};
var asyncWaterfallError = function (error){
	throw error;
};

var asyncQueue1 = function (error){
	if (error) asyncQueueError (error);
};
var asyncQueue2 = function (error){
	if (error) asyncQueueError (error);
};
var asyncQueueCb = function (task, cb){
	cb ();
	if (task.cb) task.cb ();
};
var asyncQueueError = function (error){
	throw error;
};

var asyncCargo1 = function (error){
	if (error) asyncQueueError (error);
};
var asyncCargo2 = function (error){
	if (error) asyncQueueError (error);
};
var asyncCargoCb = function (task, cb){
	cb ();
	if (task[0].cb) task[0].cb ();
};
var asyncCargoError = function (error){
	throw error;
};

var dq1 = function (cb){
	cb (null, 1);
};
var dq2 = function (cb){
	cb (null, 2);
};
var dq1cb = function (error, n){};
var dq2cb = function (error, n){};
var dqError = function (error){
	throw error;
};

speedy.run ({
	"async.series": function (cb){
		async.series ([asyncSeries1, asyncSeries2], function (error){
			if (error) return asyncSeriesError (error);
			cb ();
		});
	},
	"async.waterfall": function (cb){
		async.waterfall ([asyncWaterfall1, asyncWaterfall2], function (error){
			if (error) return asyncWaterfallError (error);
			cb ();
		});
	},
	"async.queue": function (cb){
		var c = async.queue (asyncQueueCb, 1);
		c.push ({ n: 1 }, asyncQueue1);
		c.push ({ n: 2 }, asyncQueue2);
		c.push ({ cb: cb });
	},
	"async.cargo": function (cb){
		var c = async.cargo (asyncCargoCb, 1);
		c.push ({ n: 1 }, asyncCargo1);
		c.push ({ n: 2 }, asyncCargo2);
		c.push ({ cb: cb });
	},
	"deferred queue": function (cb){
		dq ()
				.on ("error", dqError)
				.push (dq1, dq1cb)
				.push (dq2, dq2cb)
				//The last cb should me called inside dq2cb
				.push (cb)
	}
});

/*
File: async-vs-deferred-queue.js

Node v0.10.20
V8 v3.14.5.9
Speedy v0.0.8

Benchmarks: 5
Timeout: 1000ms (1s 0ms)
Samples: 3
Total time per benchmark: ~3000ms (3s 0ms)
Total time: ~15000ms (15s 0ms)

Higher is better (ops/sec)

async.series
  252,023 ± 0.4%
async.waterfall
  98,311 ± 0.1%
async.queue
  115,258 ± 0.0%
async.cargo
  88,412 ± 0.0%
deferred queue
  487,664 ± 0.0%

Elapsed time: 15366ms (15s 366ms)
*/