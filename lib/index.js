"use strict";

var events = require ("events");
var util = require ("util");

module.exports.create = function (){
	return new DeferredQueue ();
};

var DeferredQueue = function (){
	events.EventEmitter.call (this);
	this._tasks = [];
	this._current = 0;
	this._executing = false;
	this._stopped = false;
	this._error = false;
};

util.inherits (DeferredQueue, events.EventEmitter);

DeferredQueue.prototype._execute = function (){
	if (this._stopped || this._current === this._tasks.length){
		this._executing = false;
		return;
	}
	
	var e = this._tasks[this._current++];
	
	if (e.task.length){
		var me = this;
		
		e.task (function (error){
			if (error){
				me._executing = false;
				me._error = true;
				if (e.cb) e.cb (error);
				me.emit ("error", error);
			}else{
				if (e.cb) e.cb.apply (null, arguments);
				me._execute ();
			}
		});
	}else{
		try{
			var v = e.task ();
			if (e.cb) e.cb (null, v);
			this._execute ();
		}catch (error){
			this._error = true;
			this._executing = false;
			if (e.cb) e.cb (error);
			this.emit ("error", error);
		}
	}
};

DeferredQueue.prototype.pause = function (){
	this._stopped = true;
	this._executing = false;
};

DeferredQueue.prototype.push = function (task, cb){
	this._tasks.push ({ task: task, cb: cb });
	if (!this._executing && !this._stopped){
		this._executing = true;
		this._execute ();
	}
	return this;
};

DeferredQueue.prototype.restart = function (){
	this._current = 0;
	this._stopped = false;
	if (!this._executing){
		this._executing = true;
		this._execute ();
	}
};

DeferredQueue.prototype.resume = function (){
	this._stopped = false;
	if (!this._executing){
		this._executing = true;
		this._execute ();
	}
};

DeferredQueue.prototype.stop = function (){
	this._current = 0;
	this._stopped = true;
	this._executing = false;
};