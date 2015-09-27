/**
 * RAPID CRUD controller
 *
 * @description :: 
 * @help        :: 
 */

var dbs   = require('./dbcon.js');
var utils = require('./fgen.js')
var rdb   = require('./rapidpg.js')

module.exports = {
   /**
   * CommentController.create()
   */
  command: function (req, res) {
	if (req.body) {
		//console.log(req.body.constructor)
		if (req.body.constructor !== Object) {return res.send({error:"Invalid Request body - should be Object"})};
	}
	var table = req.params["0"];
	var rcfg  = process.rapidcfg;
        var rmethod = req.method
	var extname = ""
	/* code for database distribution here ! */
	function GetUserDistName(lcstring){ return utils.hash(lcstring,1).toLowerCase()}		
	/* end */
	/* code for REDIS distribution here ! */
	function GetUserDistCache(lcstring){ return utils.hash(lcstring,1).toLowerCase()}		
	/* end */ 
	// check for table
	var accepted_list = rcfg.mdb.tables.names.slice(0);;
	accepted_list.push('up_data');
	accepted_list.push('up_tdata');
	accepted_list.push('rpdquery');
	if (utils.findin(accepted_list,table)){
		var primary_key = rcfg.mdb.tables.keys[table]
		if(!primary_key){
			if (table!='up_data' && table!='up_tdata' && table!='rpdquery'){
			return res.send({error:"Table - "+table+" - primary key not found in database!"})};
		} else {
		var dbcon = {};
		var rediscon = {};
		var base_db = rcfg.mdb.tables.db[table];
		if (rcfg.distributeddata == 1 && rcfg.mdb.databases[base_db].distributeddata==1){
			//extname = GetUserDistName(req.session.username.toLowerCase());
			//var dist_db = base_db +'_'+extname;
			//console.log(rcfg.mdb.databases[base_db].distributeddata)
			//req.session.username
			var dist_db = dbs.getdbdist(base_db,req.token.user);
			dbcon = rcfg.mdb.connections[dist_db];
			dbcon.rapiddb = dist_db
		} else {dbcon = rcfg.mdb.databases[base_db];dbcon.rapiddb = base_db};
		//console.log(dbcon);
		if (rcfg.distributedcache == 1){
			//req.session.username
			redisname = GetUserDistCache(req.token.user.toLowerCase());
			//console.log(redisname);
			rediscon  = rcfg.mdb.redis[redisname];
		};
		//console.log(rediscon);
		var table_structure = rcfg.mdb.tables.structures[table] }
		function rdbcallback(error,message){
			//console.log('Callback:');
			if (error){
				if(error){console.log(error)};
				//console.log(typeof(error.error));
				//console.log(Object.keys(error.error).length);
				res.status(400);
				return res.send(error)} 
			else {
				//console.log(message);
				return res.send(message)}
			};
		function rapidfind(){
			if (table == 'rpdquery'){
				rdb.runsql(req,rdbcallback);
			} else {
				if (req.query[primary_key]){
					rdb.find(req,table,primary_key,table_structure,dbcon,rediscon,rdbcallback);
				} else {
				//res.status(400);return res.send({error:'Query error/Primary key not found in GET:Query parameters'})
				rdb.find(req,table,false,table_structure,dbcon,rediscon,rdbcallback);
				}
			}
		};
		function rapidcreate(){
			if (req.body){
				function defaultcreate(){rdb.create(req,table,primary_key,table_structure,dbcon,rediscon,rdbcallback)}
				function up_data(){rdb.dataset(req,false,rdbcallback)}
				function up_tdata(){rdb.dataset(req,true,rdbcallback)}
				switch (table) {
				case 'up_tdata':
					if (rcfg.mdb.tables.structures[table]){
					if (Object.keys(req.body).length > 1){
						defaultcreate();
					}else {up_tdata}} else {
					up_tdata()};
					break;
				case 'up_data':
					if (rcfg.mdb.tables.structures[table]){
					if (Object.keys(req.body).length > 1){
						defaultcreate();
					}else {up_data()}} else {
					up_data()};
					break;
				default: defaultcreate()};
			} else {res.status(400);return res.send({error:'Query error/No parameters found-POST:Body/required format JSON'})}
		};
		function rapidupdate(){
			if (req.body[primary_key]){
				rdb.update(req,table,primary_key,table_structure,dbcon,rediscon,rdbcallback)
			} else {res.status(400);return res.send({error:'Query error/Primary key not found in PUT:Body parameters'})}
		};
		function rapiddelete(){
			var key_value = false
			var key_value = req.query[primary_key]
			if (!key_value){key_value = req.body[primary_key]}
			if (key_value){
				rdb.destroy(req,table,primary_key,table_structure,dbcon,key_value,rediscon,rdbcallback)
			} else {res.status(400);return res.send({error:'Query error/Primary key not found in DELETE:Query parameters'})}
		};
		switch (rmethod) {
	    	case 'GET':rapidfind();break;
	    	case 'POST':rapidcreate();break;
		case 'PUT':rapidupdate();break;
		case 'DELETE':rapiddelete();break;
	    	default:
			return res.send({error:"Method - "+req.method+" - not alowed!"});
		} 
	} else { return res.send({error:"Table - "+ table+" - not found!"})}; // code for waterline redirect here !
  }
};

