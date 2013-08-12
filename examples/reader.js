"use strict";

var events = require ("events");
var util = require ("util");
var fs = require ("fs");
var dq = require ("../lib");

/*
The basic idea for wrapping asynchronous functions is to execute the original
code from inside a task.
*/

var Reader = function (path){
	events.EventEmitter.call (this);
	this._path = path;
	this._fd = null;
	var me = this;
	this._q = dq.create ();
	this._q.on ("error", function (error){
		//Forward the queue error event to the reader error handler
		if (!me._fd) return me.emit ("error", error);
		fs.close (me._fd, function (){
			//The close error is ignored
			me.emit ("error", error);
		});
	});
};

util.inherits (Reader, events.EventEmitter);

Reader.prototype._open = function (cb){
	var me = this;
	fs.open (this._path, "r", function (error, fd){
		if (error) return cb (error);
		me._fd = fd;
		cb ();
	});
};

Reader.prototype.close = function (){
	var me = this;
	
	this._q.push (function (done){
		if (!me._fd) return done ();
		fs.close (me._fd, function (error){
			done (error);
		});
	}, function (error){
		//If an error occurs we don't want to call the default error handler
		//because it tries to close the file automatically, so if close() fails
		//there would be infinite calls to close()
		if (error){
			this.preventDefault ();
			me.emit ("error", error);
		}else{
			me.emit ("close");
		}
	});
};

Reader.prototype.read = function (bytes, cb){
	var me = this;
	
	this._q.push (function (done){
		var read = function (){
			fs.read (me._fd, new Buffer (bytes), 0, bytes, null,
					function (error, bytesRead, buffer){
				if (error) return done (error);
				done (null, bytesRead, buffer.slice (0, bytesRead));
			});
		};
	
		if (!me._fd){
			me._open (function (error){
				if (error) return done (error);
				read ();
			});
		}else{
			read ();
		}
	}, function (error, bytesRead, buffer){
		if (!error) cb (bytesRead, buffer);
	});
	
	return this;
};

new Reader ("reader.js")
		.on ("error", function (error){
			console.error (error);
		})
		.on ("close", function (){
			console.log ("closed");
		})
		.read (10, function (bytesRead, buffer){
			console.log (buffer);
		})
		.read (20, function (bytesRead, buffer){
			console.log (buffer);
		})
		.close ();

/*
<Buffer 22 75 73 65 20 73 74 72 69 63>
<Buffer 74 22 3b 0d 0a 0d 0a 76 61 72 20 65 76 65 6e 74 73 20 3d 20>
closed
*/