"use strict";

/*
Shows how to build a client that connects to a database and performs CRUD
operations with a user. It can be easily refactored in order to connect to a
restful server and send http requests.
*/

var events = require ("events");
var util = require ("util");
var dq = require ("../lib/deferred-queue");

//Simulates a database
var users = [];

var client = {};

client.create = function (hostname, port){
	var c = new Client (hostname, port);
	process.nextTick (function (){
		//Allow the user to attach event handlers before connecting to the server
		c._connect ();
	});
	return c;
};

var Client = function (hostname, port){
	events.EventEmitter.call (this);
	this._hostname = hostname;
	this._port = port;
};

util.inherits (Client, events.EventEmitter);

Client.prototype._connect = function (){
	//Connect to this._hostname, this._port
	process.nextTick (this.emit.bind (this, "connect"));
};

Client.prototype.disconnect = function (){
	process.nextTick (this.emit.bind (this, "disconnect"));
};

var init = function (client){
	this._client = client;
	var me = this;
	this._queue = dq.create ();
	this._queue.on ("error", function (error){
		me._client.emit ("error", error);
	});
};

var User = function (client){
	if (this instanceof User){
		if (arguments.length !== 1){
			throw new Error ("USER_INVALID_CALL");
		}
		return init.call (this, client);
	}
	return new User (this);
};

User.prototype._addTask = function (task, cb){
	this._queue.push (task, function (error){
		//Errors are redirected to the error handler, we don't want to pass them to
		//the possible callback
		if (error) return;
		if (cb){
			//Remove the first parameter (error)
			var args = Array.prototype.slice.call (arguments);
			args.shift ();
			cb.apply (undefined, args);
		}
	});
};

User.prototype.create = function (u, cb){
	this._addTask (function (cb){
		//Simulates a database insert()
		process.nextTick (function (){
			users.push (u);
			cb ();
		});
	}, cb);
	return this;
};

User.prototype.read = function (u, cb){
	this._addTask (function (cb){
		//Simulates a database find()
		process.nextTick (function (){
			for (var i=0, len=users.length; i<len; i++){
				if (users[i].name === u.name) return cb (null, users[i]);
			}
		});
	}, cb);
	return this;
};

User.prototype.update = function (u, args, cb){
	this._addTask (function (cb){
		//Simulates a database update()
		process.nextTick (function (){
			for (var i=0, len=users.length; i<len; i++){
				if (users[i].name === u.name){
					for (var p in args){
						users[i][p] = args[p];
						return cb ();
					}
				}
			}
		});
	}, cb);
	return this;
};

User.prototype.remove = function (u, cb){
	this._addTask (function (cb){
		//Simulates a database remove()
		process.nextTick (function (){
			for (var i=0, len=users.length; i<len; i++){
				if (users[i].name === u.name){
					users.splice (i, 1);
					return cb ();
				}
			}
		});
	}, cb);
	return this;
};

Client.prototype.User = User;


/*
Usage example:

1. Create Maria
2. Create Paul
3. Read Maria
4. Update Paul
5. Remove Maria
6. Read Paul

If any of these operations fail the queue is stopped and the error handler is
executed with the error.

A deferred queue is useful when you need to execute tasks with an specific
order. The tasks are configured synchronously but executed asynchronously.
*/

var c = client.create ();

c.on ("error", function (error){
	console.error (error);
});

c.on ("connect", function (){
	var u = c.User ()
			.create ({ name: "Maria", age: 23 })
			.create ({ name: "Paul", age: 10 })
			.read ({ name: "Maria" }, function (data){
				console.log ("Maria: " + util.inspect (data, null, true));
				//{ name: "Maria", age: 23 }
			})
			.update ({ name: "Paul" }, { location: "Spain" }, function (){
				//Task executed after "remove()"
				u.read ({ name: "Paul" }, function (data){
					console.log ("Paul: " + util.inspect (data, null, true));
					//{ name: "Paul", age: 10, location: "Spain" }
					
					c.disconnect ();
				});
			})
			.remove ({ name: "Maria" });
});

c.on ("disconnect", function (){
	console.log ("Users: " + util.inspect (users, null, true));
});