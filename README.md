deferred-queue
==============

_Node.js project_

#### Asynchronous deferred queue ####

Version: 0.0.2

A deferred queue enqueues tasks synchronously and executes them asynchronously.

Have you seen the [Redis driver](https://github.com/mranney/node_redis) and the [Express middleware](https://github.com/visionmedia/express)? This is how a deferred queue works. It's a very simplified version of [promises](https://github.com/kriskowal/q).

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
				D ();
			}else{
				E ();
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
					D ();
				}else{
					E (function (error){
						if (error) fn ();
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
		//Any error returned by A, B or the pushed anonymous function
	})
	.push (A)
	.push (B)
	.push (function (cb){
		C (function (result){
				if (result){
					D (cb));
				}else{
					E (function (error){
						cb (error);
						if (error) q.restart ();
					});
				}
			});
	})
```

The benefits are:
- You don't need to nest calls.
- The content is created only once. When you call to `restart()` you're just executing the previous tasks again. Well, in fact, in the previous example the functions that are passed to C and E are created every restart but this is because they're not in the queue. All the functions that are enqueued with `push()` are only created once.
- When a function is pushed it is added to the queue and tries to execute. If there are pending functions that needs to execute, it simply waits. You can imagine it as a dynamic queue that can increase in size at any time and is always executing.

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
- It is very useful when you need to do some asynchronous tasks in a certain order or you want to expose your asynchronous functions so the user can use them in a synchronous way but executed asynchronously, like [node-redis](https://github.com/mranney/node_redis) does.


#### Example ####

```javascript
var dq = require ("deferred-queue");

var q = dq.create ();
var again = true;

q.on ("error", function (error){
	console.error ("something went wrong: " + error);
});

q.push (function (cb){
	process.nextTick (function (){
		console.log (1);
		cb ();
	});
});

q.push (function (cb){
	process.nextTick (function (){
		console.log (2);
		cb ();
	});
}, function (){
	q.pause ();
	setTimeout (function (){
		q.resume ();
	}, 1000);
});

q.push (function (cb){
	process.nextTick (function (){
		console.log (3);
		if (again){
			again = false;
			cb (null, "again");
		}else{
			cb ("error");
		}
	});
}, function (error, msg){
	if (!error){
		console.log (msg);
		q.restart ();
	}
});

q.push (function (cb){
	//Never executes, the first time because the queue is restarted and the second
	//because the previous task returns an error
	process.nextTick (function (){
		console.log (4);
	});
});

/*
Prints:

1
2
(1000ms delay)
3
again
1
2
(1000ms delay)
3
something went wrong: error
*/
```

#### Methods and Properties ####

- [dq.create()](#create)
- [Queue#pause()](#pause)
- [Queue#push(task[, result])](#push)
- [Queue#restart()](#restart)
- [Queue#resume()](#resume)
- [Queue#stop()](#stop)

<a name="create"></a>
__df.create()__  
Creates a deferred queue.

<a name="pause"></a>
__Queue#pause()__  
Pauses the queue execution.

<a name="push"></a>
__Queue#push(task[, result])__  
Adds a task and tries to execute it. If there are pending tasks, the task waits until all the previous tasks have been executed. A callback is passed as a parameter that needs to be called once the task finishes. You can pass any parameters -the first must be the error, if any, or null- to this callback and they will be redirected to the result callback.

If the task returns an error an `error` event is emitted, then the result callback is called and the next tasks are not executed.

<a name="restart"></a>
__Queue#restart()__  
Restarts the queue execution from the first task.

<a name="resume"></a>
__Queue#resume()__  
Resumes the queue execution from the next task it was paused.

<a name="stop"></a>
__Queue#stop()__  
Stops the queue execution and resets to the first task. It can be executed again with `resume()` or `restart()`.