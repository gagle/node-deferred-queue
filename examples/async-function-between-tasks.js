"use strict";

var dq = require ("../lib");

var asyncFn = function (cb){
  process.nextTick (cb);
};

dq ()
    .on ("error", function (error){
      console.error (error);
    })
    .push (function (){
      console.log (1);
    }, function (error){
      //Since this callback doesn't have any error handling mechanism, i.e.
      //cannot pass an error to a cb parameter, if you want to execute an
      //asynchronous function between 2 tasks, you have to pause the queue
      //and when the function returns resume it again
      this.pause ();
      
      var me = this;
      asyncFn (function (error){
        //Note that the queue is already paused
        if (error) return console.error (error);
        
        console.log (2);
        
        //If no error continue
        me.resume ();
      });
    })
    .push (function (){
      console.log (3);
    });

/*
1
2
3
*/