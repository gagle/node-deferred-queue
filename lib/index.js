"use strict";

var events = require ("events");
var util = require ("util");

module.exports.create = function (){
	return new DeferredQueue ();
};

var DeferredQueue = function (){
	events.EventEmitter.call (this);
	this._tasks = [];
	this._executing = false;
};

util.inherits (DeferredQueue, events.EventEmitter);

DeferredQueue.prototype._execute = function (){
	if (!this._executing || !this._tasks.length){
		this._executing = false;
		return;
	}
	
	var e = this._tasks.shift ();
	
	if (e.task.length){
		var me = this;
		e.task.call (this, function (error){
			if (error){
				me._executing = false;
				if (e.cb) e.cb.call (me, error);
				me.emit ("error", error);
			}else{
				if (e.cb) e.cb.apply (me, arguments);
				me._execute ();
			}
		});
	}else{
		try{
			var v = e.task.call (this);
			if (e.cb) e.cb.call (this, v);
			this._execute ();
		}catch (error){
			this._executing = false;
			if (e.cb) e.cb.call (this, error);
			this.emit ("error", error);
		}
	}
};

DeferredQueue.prototype.pause = function (){
	this._executing = false;
};

DeferredQueue.prototype.push = function (task, cb){
	this._tasks.push ({ task: task, cb: cb });
	if (!this._executing){
		this._executing = true;
		this._execute ();
	}
	return this;
};

DeferredQueue.prototype.resume = function (){
	if (this._executing) return;
	this._executing = true;
	this._execute ();
};

DeferredQueue.prototype.unshift = function (task, cb){
	this._tasks.unshift ({ task: task, cb: cb });
	if (!this._executing){
		this._executing = true;
		this._execute ();
	}
	return this;
};