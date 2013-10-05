"use strict";

var events = require ("events");
var util = require ("util");

module.exports = function (){
	return new DeferredQueue ();
};

var EMPTY = {};
var PAUSED = {};
var EXECUTING = {};
var ERROR = {};

var DeferredQueue = function (){
	events.EventEmitter.call (this);
	this._tasks = [];
	this._state = EMPTY;
};

util.inherits (DeferredQueue, events.EventEmitter);

DeferredQueue.prototype._execute = function (){
	if (this._state !== EXECUTING) return;
	
	if (!this._tasks.length){
		//pause-resume has been called when the queue is empty
		this._state = EMPTY;
		return;
	}
	
	this._preventDefault = false;
	var e = this._tasks.shift ();
	
	if (e.task.length){
		var me = this;
		e.task.call (this, function (error){
			if (error){
				me._state = ERROR;
				if (e.cb) e.cb.call (me, error);
				if (!me._preventDefault){
					me.emit ("error", error);
				}
			}else{
				if (e.cb) e.cb.apply (me, arguments);
				me._execute ();
			}
		});
	}else{
		try{
			var v = e.task.call (this);
			if (e.cb) e.cb.call (this, null, v);
			//The queue is always empty at this point except when it is paused and
			//new tasks are pushed
			if (this._state !== PAUSED && !this._tasks.length){
				this._state = EMPTY;
			}
			this._execute ();
		}catch (error){
			this._state = ERROR;
			if (e.cb) e.cb.call (this, error);
			if (!this._preventDefault){
				this.emit ("error", error);
			}
		}
	}
};

DeferredQueue.prototype.pause = function (){
	this._state = PAUSED;
};

DeferredQueue.prototype.pending = function (){
	return this._tasks.length;
};

DeferredQueue.prototype.preventDefault = function (){
	this._preventDefault = true;
};

DeferredQueue.prototype.push = function (task, cb){
	this._tasks.push ({ task: task, cb: cb });
	//If the queue is paused the push auto-executes it again
	if (this._state === EMPTY){
		this._state = EXECUTING;
		this._execute ();
	}
	return this;
};

DeferredQueue.prototype.resume = function (){
	if (this._state === PAUSED){
		this._state = EXECUTING;
		this._execute ();
	}
};

DeferredQueue.prototype.unshift = function (task, cb){
	this._tasks.unshift ({ task: task, cb: cb });
	//If the queue is paused the unshift auto-executes it again
	if (this._state !== PAUSED && this._state !== EXECUTING){
		this._state = EXECUTING;
		this._execute ();
	}
	return this;
};