"use strict";

var dq = require ("../lib");

dq ()
    .on ("error", function (error){
      //This function is executed when any task fails
      //Here you typically log the error
      console.error (error);
    })
    .push (function (cb){
      //Asynchronous task
      process.nextTick (function (){
        //The first parameter is the error
        cb (null, 1, 2);
      });
    }, function (error, v1, v2){
      //v1 is 1
      //v2 is 2
      console.log (v1, v2);
      
      //Wait 1s
      var me = this;
      this.pause ();
      setTimeout (function (){
        me.resume ();
      }, 1000);
    })
    .push (function (){
      //Synchronous task
      return 5;
    }, function (error, v){
      console.log (v);
    })
    .unshift (function (cb){
      //The task is added to the beginning of the queue
      process.nextTick (function (){
        cb (null, 3, 4);
      });
    }, function (error, v1, v2){
      console.log (v1, v2);
    })
    .push (function (cb){
      process.nextTick (function (){
        cb (new Error ());
      });
    }, function (error){
      //The error is passed to this function and then is emitted if
      //preventDefault() is not called
    })
    .push (function (){
      //This task is never executed because the previous task returned an error
    });

/*
1 2
3 4
5
[Error]
*/