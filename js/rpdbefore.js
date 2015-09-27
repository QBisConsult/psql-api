/*
*   RAPID - functions:
*   RUN a function before CRUD operations on a database table
*     name of the function should be the name of the database table + its action 
*     like usersCreate,usersFind,usersUpdate, usersDelete (where users is our table in this sample)
*     parameters are (req,atr,next)
*   checkAll function runs in top of all other actions
*
*		req  = request
*		atr  = atributes object used to CREATE/UPDATE or record primary key for FIND/DELETE
*		next = callback object 
*
*     check sample page at: */				

 
var utils = require('./fgen.js');
var redis = require("redis");
var dbs   = require('./dbcon.js');

//


module.exports = {
  checkAll:function(req,atr,next){
     //var table_API = req.params["0"]; // if table_API =(up_data/up_tdata) method is POST and action is a batch command.
     //var rmethod = req.method; // GET-find/query,POST-create,PUT-update,DELETE-delete
     if (!req.token.expire){return next()}
     if (req.token.expire < new Date()){return next({message:"error",error:"expired token"})}
     return next();
    }
};
