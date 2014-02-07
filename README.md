deferred-queue
==============

#### Series control flow library ####

[![NPM version](https://badge.fury.io/js/deferred-queue.png)](http://badge.fury.io/js/deferred-queue "Fury Version Badge")
[![Build Status](https://secure.travis-ci.org/gagle/node-deferred-queue.png)](http://travis-ci.org/gagle/node-deferred-queue "Travis CI Badge")

[![NPM installation](https://nodei.co/npm/deferred-queue.png?mini=true)](https://nodei.co/npm/deferred-queue "NodeICO Badge")

This module brings to you a very lighweight control flow mechanism that it's meant to be the glue between the user calls and the asynchronous nature of your module. It provides a fluent interface, so if your module has an asynchronous API which tends to create the callback pyramid of doom, a deferred queue may help you. It can be also used as a standalone module.

For example, suppose you have an API like the following one:

```javascript
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

__Projects using this library:__

- [binary-reader](https://github.com/gagle/node-binary-reader): A real project based on the previous example.
- [seraphim](https://github.com/gagle/node-seraphim): Configuration loading made easy.

#### Documentation ####

- [async vs deferred-queue](#async-dq)

#### Functions ####

- [_module_() : DeferredQueue](#create)

#### Objects ####

- [DeferredQueue](#deferredqueue)

---

<a name="async-dq"></a>
__async vs deferred-queue__

`async.waterfall()` is the function with more similarities with a deferred queue.

```javascript
async.waterfall ([
  //Task 1
  function (cb){
    cb (null, 1, 2);
  },
  //Task 2
  function (n1, n2, cb){
    //n1 is 1, n2 is 2
    cb ();
  }
], function (error){
  if (error) return console.error (error);
});
```

```javascript
dq ()
    .on ("error", function (error){
      console.error (error);
    })
    //Task 1
    .push (function (cb){
      cb (null, 1, 2);
    }, function (error, n1, n2){
      //n1 is 1, n2 is 2
    })
    //Task 2
    .push (function (){});
```

Both are very similar but there are 3 big differences:

- `async`'s error handling has a major flaw. When something fails you don't know from which task comes the error, so you cannot apply rollback or fallback strategies.

  This library separates a task from its result. If you look at the task 1 you can see that [push()](#push) receives a second function as a parameter, it's the result of the task and is executed between two tasks: the current and the next. If the current task fails, the error is passed to this function and then the `error` event is emitted (if [preventDefault()]() is not called).

- `async.waterfall()` forwards the result values to the next task. That's ok until you need to use these values from any other task. Javascript has closures, let's use them. There's no need to pass the values to the next task, simply store them in a closure (the second parameter of [push()](#push)) and let the user decide where to save them.

    ```javascript
    var myValue;
    
    dq ()
        .on ("error", function (error){
          console.error (error);
        })
        .push (function (cb){
          cb (null, 1);
        }, function (error, n){
          if (error) return;
          myValue = n;
        })
        .push (function (){})
        .push (function (){
          //Use myValue
        });
    ```

- `async` internally uses `process.nextTick()` to call the next task. On the other hand, `deferred-queue` doesn't make any assumption, you decide how to enqueue the tasks; synchronously, asynchronously or both.

    ```javascript
    dq ()
        .on ("error", function (error){
          console.error (error);
        })
        //Synchronous
        .push (function (){})
        //Asynchronous
        .push (function (cb){
          process.nextTick (cb);
        })
        //Fake asynchronous (synchronous)
        .push (function (cb){
          cb ();
        });
    ```

---

<a name="create"></a>
___module_() : DeferredQueue__

Returns a new [DeferredQueue](#deferredqueue) instance.

```javascript
var dq = require ("deferred-queue");
var q = dq ();
```

---

<a name="deferredqueue"></a>
__DeferredQueue__

__Events__

- [error](#event_error)

__Methods__

- [DeferredQueue#pause() : undefined](#pause)
- [DeferredQueue#pending() : Number](#pending)
- [DeferredQueue#preventDefault() : undefined](#preventDefault)
- [DeferredQueue#push(task[, result]) : DeferredQueue](#push)
- [DeferredQueue#resume() : undefined](#resume)
- [DeferredQueue#unshift(task[, result]) : DeferredQueue](#unshift)

<a name="event_error"></a>
__Error__

Arguments: `error`.

Emitted when an error occurs.

---

<a name="pause"></a>
__DeferredQueue#pause() : undefined__

Pauses the queue execution. Look at the [async-function-between-tasks.js](https://github.com/gagle/node-deferred-queue/blob/master/examples/async-function-between-tasks.js) example for further details.

```javascript
q
    .push (function (){
    	//Task
    }, function (){
    	//Callback
    	this.pause ();
    })
    .push (function (){
    	//This task is not executed until you call to "resume()"
    });
```

---

<a name="pending"></a>
__DeferredQueue#pending() : Number__

Returns the number of pending tasks in the queue.

---

<a name="preventDefault"></a>
__DeferredQueue#preventDefault() : undefined__

Prevents the propagation of the error, that is, the `error` event is not emitted. It must be used from inside the callback parameter of the [push()](#push) and [unshift()](#unshift) functions.

```javascript
q.push (function (){
	//Task
	throw new Error ();
}, function (error){
	//Callback
	if (error){
		this.preventDefault ();
	}
});
```

---

<a name="push"></a>
__DeferredQueue#push(task[, result]) : DeferredQueue__

Adds a task to the end of the queue and tries to execute it. If there are pending tasks, it simply waits until all the previous tasks have been executed. Think about it like a queue that is permanently executing tasks. Whenever you add a task it can be immediately executed because the queue is empty or enqueued if there are pending tasks that need to be executed first.

The `task` is the function that you want to execute. The `result` is a callback that is executed when the task finishes.

The tasks can be synchronous or asynchronous.

__Synchronous__

You can only return one value. If you want to return an error, throw it, it will be catched. Both the error and the value are passed to the result callback, if any.

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

__Asynchronous__

If you want to execute an asynchronous task, you must call the `cb` parameter when you are ready to continue. As usual, the error is the first parameter.

```javascript
q.push (function (cb){
  process.nextTick (function (){
    cb (null, 1, 2);
  });
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

Note: Being synchronous or asynchronous depends exclusively on the user, but if you use the `cb` parameter, a different internal strategy is used. In other words, you can execute a synchronous task using the `cb` parameter. This is useful when you need to return more than one value.

There are subtle differences when the tasks are synchronous or asynchronous:

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

When an error occurs, it is passed to the callback and then, it is emitted. If you don't want to emit the error, call to [preventDefault()](#preventdefault):

```javascript
q
    .on ("error", function (error){
      //This function is not executed
    })
    .push (function (){
      throw new Error ();
    }, function (error){
      if (error) this.preventDefault ();
    });
```

__I want to execute an asynchronous function inside the result callback__

You can. Pause the queue and when you are ready to continue, resume it. Look at the [async-function-between-tasks.js](https://github.com/gagle/node-deferred-queue/blob/master/examples/async-function-between-tasks.js) example for further details.

---

<a name="resume"></a>
__DeferredQueue#resume() : undefined__

Resumes the queue execution. Look at the [async-function-between-tasks.js](https://github.com/gagle/node-deferred-queue/blob/master/examples/async-function-between-tasks.js) example for further details.

---

<a name="unshift"></a>
__DeferredQueue#unshift(task[, result]) : DeferredQueue__

Adds a task to the beginning of the queue. It has the same functionality as the [push()](#push) function.