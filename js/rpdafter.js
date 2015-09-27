/*
*   RAPID - functions
*   RUN a function after CRUD operations on a database table (just before the response is sent)
*     name of the function should be the name of the database table + its action 
*     like usersCreate,usersFind,usersUpdate, usersDelete (where users is our table in this sample)
*     parameters are (req,atr,next)
*		req  = request
*		atr  = response message object 
*		next = callback object
*
*     check sample page at:				*/ 

var utils = require('./fgen.js');

module.exports = {
	
};
