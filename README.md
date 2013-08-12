deferred-queue
==============

_Node.js project_

#### Asynchronous deferred queue ####

Version: 0.1.1

A deferred queue enqueues tasks synchronously and executes them asynchronously.

Have you seen the [Redis driver](https://github.com/mranney/node_redis)? This is how a deferred queue works.

This module is a very lighweight and simplified version of [promises](https://github.com/kriskowal/q). It's meant to be the glue between synchronous api calls and asynchronous executions.

This module can be helpful to you if you are exposing an api like the following one:

```javascript
var Reader = require ("...");

var r = new Reader ("file");

r.read (10, function (error, bytesRead, buffer){
	if (error) return console.error (error);
	fn1 (bytesRead, buffer);
	
	r.read (20, function (error, bytesRead, buffer){
		if (error) return console.error (error);
		fn2 (bytesRead, buffer);
		
		r.close (function (error){
			if (error) return console.error (error);
			fn3 ();
		});
	});
});
```

The above example has two problems: the callback nesting and the error handling. With a deferred queue the example can be rewritten as follows:

```javascript
var Reader = require ("...");

var r = new Reader ("file");

r.on ("error", function (error){
	console.error (error);
});
r.on ("close", fn3);
r.read (10, fn1);
r.read (20, fn2);
r.close ();
```

Look at the [reader](https://github.com/gagle/node-deferred-queue/blob/master/examples/reader.js) example for further details.

#### Installation ####

```
npm install deferred-queue
```

#### Functions ####

- [_module_.create() : DeferredQueue](#create)

#### Objects ####

- [DeferredQueue](#deferredqueue)

---

<a name="create"></a>
___module_.create() : DeferredQueue__

Creates a new `DeferredQueue`.

---

<a name="deferredqueue"></a>
__DeferredQueue__

__Methods__

- [DeferredQueue#pause() : undefined](#pause)
- [DeferredQueue#preventDefault() : undefined](#preventDefault)
- [DeferredQueue#push(task[, callback]) : DeferredQueue](#push)
- [DeferredQueue#resume() : undefined](#resume)
- [DeferredQueue#unshift(task[, callback]) : DeferredQueue](#unshift)

<a name="pause"></a>
__DeferredQueue#pause() : undefined__

Pauses the queue execution.

<a name="preventDefault"></a>
__DeferredQueue#preventDefault() : undefined__

Prevents the propagation of the error to the default error handler.

<a name="push"></a>
__DeferredQueue#push(task[, callback]) : DeferredQueue__

Adds a task and tries to execute it. If there are pending tasks, the task waits until all the previous tasks have been executed.

The task is what you want to execute. The callback is executed with the result of the task.

If the task is synchronous you don't need to call any callback, simply return a value. If you want to return an error, throw it, it will be catched. The value that is returned is passed to the callback.

```javascript
q.push (function (){
	return 1;
}, function (error, value){
	//error is null
	//value is 1
});
```

```javascript
q.push (function (){
	throw 1;
}, function (error, value){
	//error is 1
	//value is undefined
});
```

If the task is asynchronous, a function is passed as parameter. As usual, the error is the first parameter.

```javascript
q.push (function (cb){
	cb (null, 1, 2);
}, function (error, v1, v2){
	//error is null
	//v1 is 1
	//v2 is 2
});
```

```javascript
q.push (function (cb){
	cb (1);
}, function (error, v1, v2){
	//error is 1
	//v1 and v2 are undefined
});
```

There are subtle differences when the tasks are synchronous and asynchronous:

```javascript
q.push (A);
q.push (function (){
	q.push (C);
	q.push (D);
});
q.push (B);
```

If A, B, C, D are asynchronous: A → B → C → D. [Asynchronous](https://github.com/gagle/node-deferred-queue/blob/master/examples/asynchronous.js) example.  
If A, B, C, D are synchronous: A → C → D → B. [Synchronous](https://github.com/gagle/node-deferred-queue/blob/master/examples/synchronous.js) example.  

The error is also emitted with an `error` event. The queue is automatically paused, so if you want to resume it you'll need to call to [resume()](#resume). If you don't want to propagate the error to the default error handler call to the [preventDefault()](#preventdefault) function from inside the callback:

```javascript
q.on ("error", function (error){
	//This function is not executed
})
q.push (function (cb){
	cb (new Error ("error"));
}, function (error){
	if (error) this.preventDefault ();
});
```

<a name="resume"></a>
__DeferredQueue#resume() : undefined__

Resumes the queue execution from the task it was paused.

<a name="unshift"></a>
__DeferredQueue#unshift(task[, callback]) : DeferredQueue__

Adds a task to the beginning of the queue. It has the same functionality as the [push()](#push) function.