deferred-queue
==============

_Node.js project_

#### Asynchronous deferred queue ####

Version: 0.2.0

This module brings to you a very lighweight control flow mechanism that it's meant to be used as the interface between the user synchronous calls and the asynchronous nature of your module. It provides a fluent interface, so if your module has an asynchronous api which tends to create the callback pyramid of doom, a deferred queue may help you. It can be also used with any built-in function.

Have you seen the [Redis driver](https://github.com/mranney/node_redis)? This is how a deferred queue works.

For example, suppose you have an api like the following one:

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

Look at the [reader](https://github.com/gagle/node-deferred-queue/blob/master/examples/reader.js) example for further details. The [binary-reader](https://github.com/gagle/node-binary-reader) module is a real example which is based on this reader.

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
- [DeferredQueue#pending() : Number](#pending)
- [DeferredQueue#preventDefault() : undefined](#preventDefault)
- [DeferredQueue#push(task[, callback]) : DeferredQueue](#push)
- [DeferredQueue#resume() : undefined](#resume)
- [DeferredQueue#unshift(task[, callback]) : DeferredQueue](#unshift)

<a name="pause"></a>
__DeferredQueue#pause() : undefined__

Pauses the queue. It should be used inside the callback of the `push()` or `unshift()` functions.

```javascript
dq.create ()
    .push (function (){
      //Task
    }, function (){
      //Callback
      this.pause ();
    });
```

<a name="pending"></a>
__DeferredQueue#pending() : Number__

Returns the number of pending tasks in the queue.

<a name="preventDefault"></a>
__DeferredQueue#preventDefault() : undefined__

Prevents the propagation of the error to the default error handler. If an error occurs no `error` event is emitted. It should be used inside the callback of the `push()` or `unshift()` functions.

```javascript
dq.create ()
    .push (function (){
      //Task
    }, function (error){
      //Callback
      if (error){
        this.preventDefault ();
      }
    });
```

<a name="push"></a>
__DeferredQueue#push(task[, callback]) : DeferredQueue__

Adds a task and tries to execute it. If there are pending tasks, the task waits until all the previous tasks have been executed.

The task is the function that you want to execute. The callback is executed with the result of the previous task.

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

The error is also emitted with an `error` event. The queue is automatically paused. If you don't want to propagate the error to the default error handler call to the [preventDefault()](#preventdefault) function from inside the callback:

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

Resumes the queue from the next task it was paused. It should be used inside the callback of the `push()` or `unshift()` functions.

```javascript
dq.create ()
    .push (function (){
      //Task
    }, function (){
      //Callback
      this.pause ();
      var me = this;
      foo (function (error){
        if (error) return console.error (error);
        me.resume ();
      });
    });
```

<a name="unshift"></a>
__DeferredQueue#unshift(task[, callback]) : DeferredQueue__

Adds a task to the beginning of the queue. It has the same functionality as the `push()` function.