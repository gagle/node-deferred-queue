"use strict";

var speedy = require ("speedy");
var dq = require ("./libs/deferred-queue");
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
	"deferred queue": function (cb){
		dq.module ()
				.on ("error", dq.error)
				.push (dq.fn1, dq.fn3)
				.push (dq.fn2, dq.fn4)
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

Benchmarks: 6
Timeout: 1000ms (1s 0ms)
Samples: 3
Total time per benchmark: ~3000ms (3s 0ms)
Total time: ~18000ms (18s 0ms)

Higher is better (ops/sec)

async.series
  234,209 ± 0.3%
async.waterfall
  97,090 ± 0.2%
async.queue
  112,793 ± 0.2%
async.cargo
  89,458 ± 0.1%
deferred queue
  503,729 ± 0.0%
step
  473,415 ± 0.2%

Elapsed time: 18440ms (18s 440ms)
*/