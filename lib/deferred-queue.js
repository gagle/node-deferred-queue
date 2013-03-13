"use strict";

var events = require ("events");
var util = require ("util");

var queue = module.exports = {};

queue.create = function (){
	return new Queue ();
};

var Queue = function (){
	events.EventEmitter.call (this);
	this._array = [];
	this._current = 0;
	this._executing = false;
	this._stopped = false;
};

util.inherits (Queue, events.EventEmitter);

Queue.prototype._execute = function (){
	if (this._stopped || this._current === this._array.length){
		this._executing = false;
		return;
	}
	var e = this._array[this._current];
	var me = this;
	e.task (function (error){
		me._current++;
		if (e.cb) e.cb.apply (undefined, arguments);
		if (error){
			me._executing = false;
			me.emit.apply (me,
					["error"].concat (Array.prototype.slice.call (arguments)));
		}else{
			me._execute ();
		}
	});
};

Queue.prototype.pause = function (){
	this._stopped = true;
	this._executing = false;
};

Queue.prototype.push = function (task, cb){
	this._array.push ({ task: task, cb: cb });
	if (!this._executing && !this._stopped){
		this._executing = true;
		this._execute ();
	}
	return this;
};

Queue.prototype.restart = function (){
	this._current = 0;
	this._stopped = false;
	if (!this._executing){
		this._executing = true;
		this._execute ();
	}
};

Queue.prototype.resume = function (){
	this._stopped = false;
	if (!this._executing){
		this._executing = true;
		this._execute ();
	}
};

Queue.prototype.stop = function (){
	this._current = 0;
	this._stopped = true;
	this._executing = false;
};