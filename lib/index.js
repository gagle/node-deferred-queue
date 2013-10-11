"use strict";

var events = require ("events");
var util = require ("util");

module.exports = function (){
	return new DeferredQueue ();
};

var EMPTY = {};
var PAUSED = {};
var STOPPED = {};
var EXECUTING = {};
var ERROR = {};

var DeferredQueue = function (){
	events.EventEmitter.call (this);
	this._tasks = [];
	this._state = EMPTY;
};

util.inherits (DeferredQueue, events.EventEmitter);

DeferredQueue.prototype._resume = function (){
	if (this._state === PAUSED){
		this._state = EXECUTING;
		this._execute ();
	}
};

DeferredQueue.prototype._execute = function (){
	if (this._state !== EXECUTING) return;
	
	if (!this._tasks.length){
		this._state = EMPTY;
		return;
	}
	
	this._preventDefault = false;
	var e = this._tasks.shift ();
	var me = this;
	
	if (e.task.length){
		e.task.call (this, function (error){
			if (error){
				me._state = ERROR;
				if (e.cb) e.cb.call (me, error);
				if (!me._preventDefault){
					me.emit ("error", error);
				}
			}else{
				if (e.cb){
					if (e.cb.length < (arguments.length || 1) + 1){
						e.cb.apply (me, arguments);
						me._execute ();
					}else{
						me._state = PAUSED;
						
						var args = Array.prototype.slice.call (arguments);
						if (!args.length) args.push (null);
						
						args.push (function (error){
							//External errors are automatically redirected to the error event
							if (error){
								me._state = ERROR;
								me.emit ("error", error);
								return;
							}
							me._resume ();
						});
						
						e.cb.apply (me, args);
					}
				}else{
					me._execute ();
				}
			}
		});
	}else{
		var err;
		
		try{
			var v = e.task.call (this);
		}catch (error){
			err = true;
			this._state = ERROR;
			if (e.cb) e.cb.call (this, error);
			if (!this._preventDefault){
				this.emit ("error", error);
			}
		}
		
		if (err) return;
		
		if (e.cb){
			var next = function (error){
				//External errors are automatically redirected to the error event
				if (error){
					me._state = ERROR;
					me.emit ("error", error);
					return;
				}
				me._resume ();
			};
		
			this._state = PAUSED;
			var length = (v === undefined ? 2 : 3);
			if (e.cb.length < length){
				e.cb.call (this, null, v);
				me._resume ();
			}else{
				//Note: call() is faster than apply()
				if (length === 2){
					e.cb.call (this, null, next);
				}else{
					e.cb.call (this, null, v, next);
				}
			}
		}else{
			me._execute ();
		}
	}
};

DeferredQueue.prototype.stop = function (){
	this._state = STOPPED;
};

DeferredQueue.prototype.pending = function (){
	return this._tasks.length;
};

DeferredQueue.prototype.preventDefault = function (){
	this._preventDefault = true;
};

DeferredQueue.prototype.push = function (task, cb){
	if (this._state === ERROR) return;
	this._tasks.push ({ task: task, cb: cb });
	//If the queue is paused the push auto-executes it again
	if (this._state === EMPTY){
		this._state = EXECUTING;
		this._execute ();
	}
	return this;
};

DeferredQueue.prototype.unshift = function (task, cb){
	if (this._state === ERROR) return;
	this._tasks.unshift ({ task: task, cb: cb });
	//If the queue is paused the unshift auto-executes it again
	if (this._state === EMPTY){
		this._state = EXECUTING;
		this._execute ();
	}
	return this;
};