"use strict";

/*
Shows how to build a client app that connects to a database and performs CRUD
operations with a user. It can be easily refactored in order to connect to a
restful server and send http requests.
*/

var events = require ("events");
var util = require ("util");
var dq = require ("../lib");

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
	//Simulates a database connect()
	process.nextTick (this.emit.bind (this, "connect"));
};

Client.prototype.disconnect = function (){
	//Simulates a database disconnect()
	process.nextTick (this.emit.bind (this, "disconnect"));
};

var init = function (client){
	this._client = client;
	var me = this;
	this._q = dq ();
	this._q.on ("error", function (error){
		me._client.emit ("error", error);
	});
};

var User = function (client){
	//"this" points to the user instance
	if (this instanceof User){
		if (arguments.length !== 1){
			throw new Error ("USER_INVALID_CALL");
		}
		return init.call (this, client);
	}
	//"this" points to the client instance
	//The constructor is called without "new"
	return new User (this);
};

Client.prototype.User = User;

User.prototype.create = function (u, cb){
	this._q.push (function (done){
		//Simulates a database insert()
		process.nextTick (function (){
			users.push (u);
			done ();
		});
	}, function (error){
		if (!error && cb) cb ();
	});
	return this;
};

User.prototype.read = function (u, cb){
	this._q.push (function (done){
		//Simulates a database find()
		process.nextTick (function (){
			for (var i=0, len=users.length; i<len; i++){
				if (users[i].name === u.name) return done (null, users[i]);
			}
			done (null, null);
		});
	}, function (error, data){
		if (!error && cb) cb (data);
	});
	return this;
};

User.prototype.update = function (u, args, cb){
	this._q.push (function (done){
		//Simulates a database update()
		process.nextTick (function (){
			for (var i=0, len=users.length; i<len; i++){
				if (users[i].name === u.name){
					for (var p in args){
						users[i][p] = args[p];
						return done ();
					}
				}
			}
			done (new Error ("User not found"));
		});
	}, function (error){
		if (!error && cb) cb ();
	});
	return this;
};

User.prototype.remove = function (u, cb){
	this._q.push (function (done){
		//Simulates a database remove()
		process.nextTick (function (){
			for (var i=0, len=users.length; i<len; i++){
				if (users[i].name === u.name){
					users.splice (i, 1);
					return done ();
				}
			}
			done (new Error ("User not found"));
		});
	}, function (error){
		if (!error && cb) cb ();
	});
	return this;
};

/*
Usage example:

1. Create Maria
2. Create Paul
3. Read Maria
4. Update Paul
5. Remove Maria
6. Read Paul

If any of these operations fail the queue is paused and the error handler is
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
				console.log ("Maria: " + util.inspect (data, { depth: null }));
				//{ name: "Maria", age: 23 }
			})
			.update ({ name: "Paul" }, { location: "Spain" }, function (){
				//Task executed after "remove()"
				u.read ({ name: "Paul" }, function (data){
					console.log ("Paul: " + util.inspect (data, { depth: null }));
					//{ name: "Paul", age: 10, location: "Spain" }
					
					c.disconnect ();
				});
			})
			.remove ({ name: "Maria" });
});

c.on ("disconnect", function (){
	console.log ("Users: " + util.inspect (users, { depth: null }));
});

/*
Maria: { name: "Maria", age: 23 }
Paul: { name: "Paul", age: 10, location: "Spain" }
Users: [ { name: "Paul", age: 10, location: "Spain" } ]
*/