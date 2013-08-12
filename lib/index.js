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
	this._error = false;
	this._preventDefault = false;
	this._cb = false;
	this._resume = false;
};

util.inherits (DeferredQueue, events.EventEmitter);

DeferredQueue.prototype._execute = function (){
	if (this._error || !this._executing || !this._tasks.length){
		this._executing = false;
		return;
	}
	
	this._preventDefault = false;
	var e = this._tasks.shift ();
	
	if (e.task.length){
		var me = this;
		e.task.call (this, function (error){
			if (error){
				me._error = true;
				me._executing = false;
				if (e.cb){
					me._cb = true;
					e.cb.call (me, error);
					me._cb = false;
				}
				if (!me._preventDefault){
					me.emit ("error", error);
				}
				if (me._resume){
					me._resume = false;
					me.resume ();
				}
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
			this._error = true;
			this._executing = false;
			if (e.cb){
				this._cb = true;
				e.cb.call (this, error);
				this._cb = false;
			}
			if (!this._preventDefault){
				this.emit ("error", error);
			}
			if (this._resume){
				this._resume = false;
				this.resume ();
			}
		}
	}
};

DeferredQueue.prototype.pause = function (){
	this._executing = false;
};

DeferredQueue.prototype.preventDefault = function (){
	this._preventDefault = true;
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
	if (this._cb){
		this._resume = true;
		return;
	}
	this._executing = true;
	this._error = false;
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