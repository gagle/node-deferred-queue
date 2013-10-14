"use strict";

var speedy = require ("speedy");
var dq = require ("./libs/deferred-queue");
var callbacks = require ("./libs/callbacks");
var async = require ("./libs/async");
var step = require ("./libs/step");
var q = require ("./libs/q");

speedy.run ({
	"async.series": function (cb){
		async.module.series ([async.series1, async.series2], function (error){
			if (error) return async.seriesError (error);
			cb ();
		});
	},
	"async.waterfall": function (cb){
		async.module.waterfall ([async.waterfall1, async.waterfall2],
				function (error){
			if (error) return async.waterfallError (error);
			cb ();
		});
	},
	"async.queue": function (cb){
		var c = async.module.queue (async.queue3, 1);
		c.push ({ n: 1 }, async.queue1);
		c.push ({ n: 2 }, async.queue2);
		c.push ({ cb: function (){
			cb ();
		}});
	},
	"async.cargo": function (cb){
		var c = async.module.cargo (async.cargo3, 1);
		c.push ({ n: 1 }, async.cargo1);
		c.push ({ n: 2 }, async.cargo2);
		c.push ({ cb: function (){
			cb ();
		}});
	},
	"callbacks": function (cb){
		callbacks.module (function (){
			cb ();
		});
	},
	"deferred-queue.sync": function (cb){
		dq.module ()
				.on ("error", dq.error)
				.push (dq.sync1, dq.fn3)
				.push (dq.sync2, dq.fn4)
				//The last cb should be called from dq.fn4
				.push (function (){
					cb ();
				})
	},
	"deferred-queue.async": function (cb){
		dq.module ()
				.on ("error", dq.error)
				.push (dq.async1, dq.fn3)
				.push (dq.async2, dq.fn4)
				//The last cb should be called from dq.fn4
				.push (function (){
					cb ();
				})
	},
	"q": function (cb){
		q.makePromiseFn1 ()
				.then (q.fn1, q.error)
				.then (q.fn2, q.error)
				//The last cb should be called from q.fn2
				.then (cb)
				.done ();
	},
	"step": function (cb){
		step.module (
			step.fn1,
			step.fn2,
			function (error, n){
				if (error) return step.error (error);
				cb ();
			}
		);
	}
});

/*
File: index.js

Node v0.10.20
V8 v3.14.5.9
Speedy v0.0.8

Benchmarks: 9
Timeout: 1000ms (1s 0ms)
Samples: 3
Total time per benchmark: ~3000ms (3s 0ms)
Total time: ~27000ms (27s 0ms)

Higher is better (ops/sec)

async.series
  245,241 ± 0.2%
async.waterfall
  96,190 ± 0.0%
async.queue
  107,040 ± 0.1%
async.cargo
  85,646 ± 0.1%
callbacks
  3,637,659 ± 0.0%
deferred-queue.sync
  612,903 ± 0.0%
deferred-queue.async
  500,684 ± 0.0%
q
  18,723 ± 0.3%
step
  473,156 ± 0.3%

Elapsed time: 27659ms (27s 659ms)
*/