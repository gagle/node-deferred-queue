"use strict";

var assert = require ("assert");
var dq = require ("../lib");

var tests = {
	"synchronous, push": function (){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (){ arr.push (1); })
				.push (function (){ arr.push (2); })
				.push (function (){ arr.push (3); });
		
		assert.deepEqual (arr, [1, 2, 3]);
	},
	"synchronous, unshift": function (){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.unshift (function (){ arr.push (1); })
				.unshift (function (){ arr.push (2); })
				.unshift (function (){ arr.push (3); });
		
		assert.deepEqual (arr, [1, 2, 3]);
	},
	"synchronous, callback, no error": function (){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (){
					arr.push (1);
					return 1;
				}, function (error, v){
					assert.ok (!error);
					assert.strictEqual (v, 1);
					arr.push (2);
				})
				.push (function (cb){
					arr.push (3);
					cb (null, 2);
				}, function (error, v){
					assert.ok (!error);
					assert.strictEqual (v, 2);
					arr.push (4);
				})
				.push (function (){
					arr.push (5);
					return 3;
				}, function (error, v, cb){
					assert.ok (!error);
					assert.strictEqual (v, 3);
					(function (){
						arr.push (6);
						cb ();
					})();
				})
				.push (function (){
					arr.push (7);
				});
		
		assert.deepEqual (arr, [1, 2, 3, 4, 5, 6, 7]);
	},
	"synchronous, callback, error": function (){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ok (error);
					arr.push (1);
				})
				.push (function (){
					throw new Error ();
				}, function (error){
					assert.ok (error);
				});
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (){
					throw new Error ();
				}, function (error){
					assert.ok (error);
					arr.push (2);
					this.preventDefault ();
				});
		dq ()
				.on ("error", function (error){
					assert.ok (error);
					arr.push (3);
				})
				.push (function (){}, function (error, cb){
					assert.ok (!error);
					(function (){
						cb (new Error ());
					})();
				});
		
		assert.deepEqual (arr, [1, 2, 3]);
	},
	"asynchronous, push": function (done){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (cb){
					process.nextTick (function (){
						arr.push (1);
						cb ();
					});
				})
				.push (function (cb){
					process.nextTick (function (){
						arr.push (2);
						cb ();
					});
				})
				.push (function (cb){
					process.nextTick (function (){
						arr.push (3);
						cb ();
					});
				}, function (error){
					assert.ok (!error);
					assert.deepEqual (arr, [1, 2, 3]);
					done ();
				});
	},
	"asynchronous, unshift": function (done){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.unshift (function (cb){
					process.nextTick (function (){
						arr.push (1);
						cb ();
					});
				})
				.unshift (function (cb){
					process.nextTick (function (){
						arr.push (3);
						cb ();
					});
				}, function (error){
					assert.ok (!error);
					assert.deepEqual (arr, [1, 2, 3]);
					done ();
				})
				.unshift (function (cb){
					process.nextTick (function (){
						arr.push (2);
						cb ();
					});
				});
	},
	"asynchronous, callback, no error": function (done){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (cb){
					process.nextTick (function (){
						arr.push (1);
						cb (null, 1);
					});
				}, function (error, v){
					assert.ok (!error);
					assert.strictEqual (v, 1);
					arr.push (2);
				})
				.push (function (cb){
					process.nextTick (function (){
						arr.push (3);
						cb (null, 2, 3, 4);
					});
				}, function (error, v2, v3, v4, cb){
					assert.ok (!error);
					assert.strictEqual (v2, 2);
					assert.strictEqual (v3, 3);
					assert.strictEqual (v4, 4);
					process.nextTick (function (){
						arr.push (4);
						cb ();
					});
				})
				.push (function (cb){
					process.nextTick (function (){
						arr.push (5);
						cb ();
					});
				}, function (error, cb){
					assert.ok (!error);
					process.nextTick (function (){
						arr.push (6);
						cb ();
					});
				})
				.push (function (){
					arr.push (7);
				}, function (error){
					assert.ok (!error);
					assert.deepEqual (arr, [1, 2, 3, 4, 5, 6, 7]);
					done ();
				});
	},
	"asynchronous, callback, error": function (done){
		var pending = 3;
		var finish = function (){
			if (!--pending) done ();
		};
		dq ()
				.on ("error", function (error){
					assert.ok (error);
					finish ();
				})
				.push (function (cb){
					cb (new Error ());
				}, function (error){
					assert.ok (error);
				});
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (cb){
					cb (new Error ());
				}, function (error){
					assert.ok (error);
					this.preventDefault ();
					finish ();
				});
		dq ()
				.on ("error", function (error){
					assert.ok (error);
					finish ();
				})
				.push (function (){}, function (error, cb){
					assert.ok (!error);
					process.nextTick (function (){
						cb (new Error ());
					});
				});
	},
	"push and unshift, synchronous": function (){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (){
					arr.push (1);
				})
				.push (function (){
					arr.push (2);
				})
				.push (function (){
					arr.push (3);
				})
				.unshift (function (){
					arr.push (4);
				})
				.push (function (){
					arr.push (5);
				})
				.unshift (function (){
					arr.push (6);
					assert.deepEqual (arr, [1, 2, 3, 4, 5, 6]);
				});
	},
	"push and unshift, asynchronous": function (done){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (cb){
					arr.push (1);
					process.nextTick (cb);
				})
				.push (function (cb){
					arr.push (4);
					process.nextTick (cb);
				})
				.push (function (cb){
					arr.push (5);
					process.nextTick (cb);
				})
				.unshift (function (cb){
					arr.push (3);
					process.nextTick (cb);
				})
				.push (function (){
					arr.push (6);
					assert.deepEqual (arr, [1, 2, 3, 4, 5, 6]);
					done ();
				})
				.unshift (function (cb){
					arr.push (2);
					process.nextTick (cb);
				});
	},
	"push inside result, synchronous": function (){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (){
					arr.push (1);
					this.push (function (){
						arr.push (2);
						this.push (function (){
							arr.push (3);
							assert.deepEqual (arr, [1, 2, 3]);
						});
					});
				});
	},
	"push inside result, asynchronous": function (done){
		var arr = [];
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (cb){
					arr.push (1);
					var me = this;
					process.nextTick (function (){
						cb ();
						me.push (function (cb){
							arr.push (2);
							process.nextTick (function (){
								cb ();
								me.push (function (){
									arr.push (3);
									assert.deepEqual (arr, [1, 2, 3]);
									done ();
								});
							});
						});
					});
				});
	},
	"stop, asynchronous": function (done){
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (cb){
					process.nextTick (cb);
				})
				.push (function (cb){
					process.nextTick (cb);
				}, function (){
					this.stop ();
					done ();
				})
				.push (function (cb){
					assert.fail ();
					process.nextTick (cb);
				});
	},
	"stop, asynchronous, inside task": function (done){
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (cb){
					process.nextTick (cb);
				})
				.push (function (cb){
					this.stop ();
					cb ();
					done ();
				})
				.push (function (cb){
					assert.fail ();
					process.nextTick (cb);
				});
	},
	"stop, synchronous": function (){
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (){})
				.push (function (){}, function (){
					this.stop ();
				})
				.push (function (){
					assert.fail ();
				});
	},
	"stop, synchronous inside task": function (){
		dq ()
				.on ("error", function (error){
					assert.ifError (error);
				})
				.push (function (){})
				.push (function (){
					this.stop ();
				})
				.push (function (){
					assert.fail ();
				});
	}
};

var keys = Object.keys (tests);
var keysLength = keys.length;

(function again (i){
	if (i<keysLength){
		var fn = tests[keys[i]];
		if (fn.length){
			fn (function (){
				again (i + 1);
			});
		}else{
			fn ();
			again (i + 1);
		}
	}
})(0);