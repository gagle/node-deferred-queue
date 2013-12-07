"use strict";

var dq = require ("../lib");

dq ()
    .on ("error", function (error){
      console.error (error);
    })
    .push (function (cb){
      process.nextTick (function (){
        console.log (1);
        cb ();
      });
    })
    .push (function (){
      this.push (function (cb){
        process.nextTick (function (){
          console.log (3);
          cb ();
        });
      })
      .push (function (cb){
        process.nextTick (function (){
          console.log (4);
          cb ();
        });
      })
    })
    .push (function (cb){
      process.nextTick (function (){
        console.log (2);
        cb ();
      });
    });

/*
1
2
3
4
*/