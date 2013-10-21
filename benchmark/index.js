"use strict";

var speedy = require ("speedy");
var dq = require ("./libs/deferred-queue");
var callbacks = require ("./libs/callbacks");
var async = require ("./libs/async");
var step = require ("./libs/step");
var q = require ("./libs/q");
var bluebird = require ("./libs/bluebird");

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
	"bluebird": function (cb){
		bluebird.makePromiseFn1 ()
				.then (bluebird.fn1)
				.then (bluebird.fn2)
				//The last cb should be called from bluebird.fn2
				.then (function (){
					cb ();
				}, bluebird.error);
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
				.then (q.fn1)
				.then (q.fn2)
				//The last cb should be called from q.fn2
				.then (function (){
					cb ();
				}, q.error);
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

Node v0.10.21
V8 v3.14.5.9
Speedy v0.1.1

Tests: 10
Timeout: 1000ms (1s 0ms)
Samples: 3
Total time per test: ~3000ms (3s 0ms)
Total time: ~30000ms (30s 0ms)

Higher is better (ops/sec)

async.series
  242,888 ± 0.5%
async.waterfall
  94,801 ± 0.1%
async.queue
  109,327 ± 0.2%
async.cargo
  85,858 ± 0.0%
bluebird
  185,495 ± 0.1%
callbacks
  3,698,234 ± 0.0%
deferred-queue.sync
  609,216 ± 0.0%
deferred-queue.async
  500,103 ± 0.1%
q
  22,192 ± 0.2%
step
  460,773 ± 0.0%

Elapsed time: 30279ms (30s 279ms)
*/