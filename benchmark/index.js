"use strict";

var speedy = require ("speedy");
var dq = require ("./libs/deferred-queue");
var callbacks = require ("./libs/callbacks");
var async = require ("./libs/async");
var step = require ("./libs/step");

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

Benchmarks: 8
Timeout: 1000ms (1s 0ms)
Samples: 3
Total time per benchmark: ~3000ms (3s 0ms)
Total time: ~24000ms (24s 0ms)

Higher is better (ops/sec)

async.series
  245,959 ± 0.1%
async.waterfall
  97,994 ± 0.0%
async.queue
  114,693 ± 0.1%
async.cargo
  90,512 ± 0.1%
callbacks
  3,805,804 ± 0.0%
deferred-queue.sync
  624,542 ± 0.0%
deferred-queue.async
  541,965 ± 0.0%
step
  506,939 ± 0.1%

Elapsed time: 24586ms (24s 586ms)
*/