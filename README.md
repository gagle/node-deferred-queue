deferred-queue
==============

_Node.js project_

#### Asynchronous deferred queue ####

Version: 0.0.3

A deferred queue enqueues tasks synchronously and executes them asynchronously.

Have you seen the [Redis driver](https://github.com/mranney/node_redis) and the [Express middleware](https://github.com/visionmedia/express)? This is how a deferred queue works. It's a very simplified version of [promises](https://github.com/kriskowal/q).

This module is thought to be the glue between synchronous api calls and asynchronous executions.

#### Installation ####

```
npm install deferred-queue
```

#### Documentation ####

- [Introduction](#introduction)

#### Functions ####

- [_module_.create() : DeferredQueue](#create)

#### Objects ####

- [DeferredQueue](#deferredqueue)

---

<a name="introduction"></a>
__Introduction__

Say you want to execute some asynchronous tasks in the following order: A, B, C. You can do:

```javascript
A (function (){
	B (function (){
		C ();
	});	
});
```

Or you can use async:

```javascript
async.series ([A, B, C], function (){});
```

Now you want to modify the algorithm and execute D or E depending on the result of C:

```javascript
A (function (){
	B (function (){
		C (function (result){
			if (result){
				D ();
			}else{
				E ();
			}
		});
	});	
});
```

Or with async:

```javascript
async.series ([
	A,
	B,
	function (cb){
		C (function (result){
			if (result){
				D (cb);
			}else{
				E (cb);
			}
		});
	}
], function (){});
```

Now you want to repeat the whole process if E returns an error.

```javascript
var fn = function (){
	A (function (){
		B (function (){
			C (function (result){
				if (result){
					D ();
				}else{
					E (function (error){
						if (error) fn ();
					});
				}
			});
		});	
	});
};

fn ();
```

Or with async:

```javascript
var fn = function (){
	async.series ([
		A,
		B,
		function (cb){
			C (function (result){
				if (result){
					D (cb);
				}else{
					E (function (error){
						if (error) fn ();
						cb ();
					});
				}
			});
		}
	], function (){});
};

fn ();
```

Have you noticed that if E fails 10 times all the content of `fn` has to be recreated every time? That's very inefficient. 
What about if A, B, C and D can also return errors? Don't make me write the code.

With a deferred queue you can simply write:

```javascript
q
	.on ("error", function (error){
		//Any error returned by A, B or the anonymous function
		q.restart ();
	})
	.push (A)
	.push (B)
	.push (function (cb){
		C (function (result){
			if (result){
				D (cb);
			}else{
				E (cb);
			}
		});
	})
```

The benefits are:

- You don't need to nest calls.
- The content is created only once. When you call to `restart()` you're just executing the previous tasks again. Well, in fact, in the previous example the anonymous functions that is passed to C is created on each restart but this is because it isn't in the queue, it's not a task. All the functions that are enqueued with `push()` are only created once.
- When a function is pushed it is added to the queue and tries to execute itself. If there are pending functions that needs to be executed first, it simply waits. You can imagine this as a dynamic queue that can increase in size at any time and is always executing. It is similar to async's [queue](https://github.com/caolan/async#queue) function with concurrency one.

	```javascript
	q.push (A);
	q.push (function (){
		q.push (C);
		q.push (D);
	});
	q.push (B);
	```
	
	If A, B, C, D are asynchronous: A → B → C → D.  
	If A, B, C, D are synchronous: A → C → D → B.
- It is very useful when you need to execute some asynchronous tasks with a certain order or you want to expose your asynchronous functions with a synchronous api, like [node-redis](https://github.com/mranney/node_redis) does.

---

<a name="create"></a>
___module_.create() : DeferredQueue__

Creates a new `DeferredQueue`.

---

<a name="deferredqueue"></a>
__DeferredQueue__

__Methods__

- [DeferredQueue#pause() : DeferredQueue](#pause)
- [DeferredQueue#push(task[, callback]) : DeferredQueue](#push)
- [DeferredQueue#restart() : DeferredQueue](#restart)
- [DeferredQueue#resume() : DeferredQueue](#resume)
- [DeferredQueue#stop() : DeferredQueue](#stop)

<a name="pause"></a>
__DeferredQueue#pause() : DeferredQueue__

Pauses the queue execution.

<a name="push"></a>
__DeferredQueue#push(task[, callback]) : DeferredQueue__

Adds a task and tries to execute it. If there are pending tasks, the task waits until all the previous tasks have been executed.

The task is what you want to execute. The callback is executed with the result of the task.

If the task is asynchronous you don't need to call any callback, simply return. If you want to return an error, throw it, it will be catched. The value that is returned is passed to the callback.

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

The error is also emitted with an `error` event. The queue is automatically paused, so if you want to resume it you'll need to call to [resume()](#resume).

<a name="restart"></a>
__DeferredQueue#restart() : DeferredQueue__  
Restarts the queue execution from the first task.

<a name="resume"></a>
__DeferredQueue#resume() : DeferredQueue__  
Resumes the queue execution from the task it was paused.

<a name="stop"></a>
__DeferredQueue#stop() : DeferredQueue__  
Stops the queue execution and resets to the first task. It can be executed again with `resume()` or `restart()`.