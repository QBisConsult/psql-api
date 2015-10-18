var dbs   = require('./dbcon.js');
var utils = require('./fgen.js');
var rpda  = require('./rpdafter.js');
var rpdb  = require('./rpdbefore.js');

module.exports = {
	runsql: function(req,rdbcb){
		var rcfg  = process.rapidcfg;
		var query = req.query;
		//console.log(rcfg);
		function seterror(error_name,desc,has_required){
			err =	{error:error_name,
				description:desc,
				method:'GET',
				action:'rpdquery',
				notes:'run a SQL statement stored serverside by name and other required parameters'}
			if (has_required == 1){				
				err.required = ['csql', 'limit', 'offset'];
				err.csql   = 'sql statement name';
				err.limit  = 'number of records to be returned';
				err.offset = 'start record number from result set'};
				return err
			};
		function qccb(error,message){
			response = ''
			if (message){
				response = {}
				response[query.csql]=message
			}
			client.end();
			rdbcb(error,response);
		};	
		if (!query.csql)  {return rdbcb(seterror('missing parameter','csql - is required',1),'')};
		if (!query.limit) {return rdbcb(seterror('missing parameter','limit - is required',1),'')};
		if (!query.offset){return rdbcb(seterror('missing parameter','offset - is required',1),'')};
		if (!rcfg.mdb.sqls[query.csql]) {return rdbcb(seterror('Query:'+query.csql,'Query does not exist!',1),'')};
		var sqlstat = rcfg.mdb.sqls[query.csql].sqlstat;
		var arr = []		
		if (sqlstat.search("&")>-1){
		            arr = sqlstat.match(/(^|\s)&(\w+)/g).map(function(v){return v.trim().substring(1);});
		            arr = arr.filter(function (e, i, arr) {
		                return arr.lastIndexOf(e) === i;
		               });
		}
		var qp = {}
		arr.forEach(function(item){
			if (!query[item]) {return rdbcb(seterror('missing parameter',item+' - parameter is required',0),'')};	
		});		
		function dbconncb (error,message){
			if (error){
				client.end()
				return rdbcb({error:'rapid database connection error/ '+dbcon.rapiddb},"");
			}else{
				arr.forEach(function(item){
					qp[item]= query[item];	
				});
				//console.log(qp);
				dbs.getsql(client,sqlstat,qp,query.limit,query.offset,qccb);
			};
		};
		var dbcon  = {}
		var dbname = ""
		if (rcfg.mdb.databases.number == 1){
			dbname = rcfg.mdb.databases.names[0];
		} else {
			if (rcfg.mdb.sqls[query.csql]){
				dbname = rcfg.mdb.sqls[query.csql].database;
			} else {
				err = seterror('invalid parameter/ csql',query.csql +' SELECT STAT. - does not exist or is not in use',0);
				return rdbcb(err,'')};
		};
		rcfg.distributeddata === 0
		if (rcfg.distributeddata === 0 || rcfg.mdb.databases[dbname].distributeddata === 0){
			dbcon = rcfg.mdb.databases[dbname];
			dbcon.rapiddb = dbname
		} else {
			var dist_db = dbs.getdbdist(dbname,req.token.user);
			if (rcfg.mdb.connections[dist_db]){
				dbcon = rcfg.mdb.connections[dist_db];
				dbcon.rapiddb = dist_db;
			} else {
				err = seterror('distributed database setting error',dist_db +' database - does not exist',0);
				err.notes = 'distributed database settings need additional settings';
				return rdbcb(err,'');
			};
		};
		//var client = dbs.getclient(dbcon);
		//client.connect(dbconncb)
		// implement before
		var bfunc = query.csql+'RunSql'
		var client = {}
		if (typeof rpdb.checkAll == 'function'){
			rpdb.checkAll(req,req.query,checkrb);
		} else {checkrb()}
		function checkrb(){	
			if (typeof rpdb[bfunc] == 'function') {
				rpdb[bfunc](req,req.query,start);
			} else { start ()}
		}
		function start(err){
			if (err) {return rdbcb({error:err},'')};
			client = dbs.getclient(dbcon);
			client.connect(dbconncb)
		}
		//
	},
	find: function(req,table,primary_key,table_structure,dbcon,rediscon,rdbcb){
		function findrecord(){
			function qccb(error,message){
				client.end()
				delete client
				if (error){
					console.log({error:'rapid - find error',errmsg:error});
					rdbcb({error:'rapid - find error',errmsg:error},'');
				}else{
				    // implement after - code
				    function last(err){
					if (err){					
						rdbcb({error:table+' after-error',errmsg:err});
					} else {if (!message.rows[0]){rdbcb('',{})}else{
						rdbcb('',message.rows)}};
				    };
				    var afunc = table+'Find'
				    if (typeof rpda[afunc] == 'function') {
					rpda[afunc](req,message.rows,last);
				    } else {last()}
				}
			}
			
			var key_value = req.query[primary_key]
			var qval = []
			if (primary_key){
				var sqlstat = "select * from "+table+" where " + primary_key +" = $1";
				qval.push(key_value)
			} else {
				var sqlstat = "select * from "+table+" limit 1000"
			}		
			if (table_structure.deleted){
				sqlstat = sqlstat + ' and deleted = false';
			}
			
			dbs.runquery(client,sqlstat,qval,0,qccb);
		}
		function dbconncb (error,message){
			if (error){
				client.end()
				delete client
				console.log({error:'rapid database connection error/'+dbcon.rapiddb});
				return rdbcb({error:'rapid database connection error/ '+dbcon.rapiddb},"");
			}else{
				findrecord();   
			};
		};
		// implement before
		var bfunc = table+'Find'
		var client = {}
		if (typeof rpdb.checkAll == 'function'){
			rpdb.checkAll(req,req.query,checkrb);
		} else {checkrb()}
		function checkrb(){
			if (typeof rpdb[bfunc] == 'function') {
				rpdb[bfunc](req,req.query,start);
			} else { start ()}
		}	
		function start(err){
			if (err) {rdbcb({error:err},'')};
			client = dbs.getclient(dbcon);
			client.connect(dbconncb)
		}
	},
	create: function(req,table,primary_key,table_structure,dbcon,rediscon,rdbcb){
		
		function createrecord(){
			function qccb(error,message){
				//console.log('client end final');
				client_PGI.end();
				delete client_PGI;
				if (error){
					console.log({error:'rapid - create error',errmsg:error});
					rdbcb({error:'rapid - create error',errmsg:error},'');
				}else{
					function last(err){
					if (err){rdbcb({error:table+' after-error',errmsg:err});
					} else {if (!message.rows[0]){rdbcb('',{})}else{
						rdbcb('',message.rows[0])}};
					};
					var afunc = table+'Create'
					if (typeof rpda[afunc] == 'function') {
						rpda[afunc](req,message.rows[0],last);
					} else {last()}
				}
			}
			var key_value = req.body[primary_key]
			if (key_value == 'rpderror'){
				if (client_PGI){
					client_PGI.end();
					delete client_PGI;
				};
				return rdbcb({error:'Insert request error',rapidinsertfields_error:'invalid primary key'},'')};
			if (Object.keys(req.body).length===0){
				if (client_PGI){
					client_PGI.end();
					delete client_PGI;
				};
				return rdbcb({error:'Insert request error',rapidinsertfields_error:'invalid request body/data'},'')};
			var ins_fields = dbs.get_fields(table_structure,primary_key,req.body,1,table)
			if(!ins_fields.rapidinsertfields_error){
				dbs.insert(client_PGI,table,ins_fields,0,qccb);
			} else {
				if (client_PGI){
					client_PGI.end();
					delete client_PGI;
				};				
				rdbcb(ins_fields.rapidinsertfields_error,'')};
		}
		function dbconncb (error,message){
			if (error){
				client_PGI.end()
				console.log({error:'rapid database connection error/'+dbcon.rapiddb});
				return rdbcb({error:'rapid database connection error/ '+dbcon.rapiddb},"");
			}else{
				createrecord();    
			};
		};
		// implement before
		var bfunc = table+'Create'
		var client_PGI = {}
		if (typeof rpdb.checkAll == 'function'){
			rpdb.checkAll(req,req.query,checkrb);
		} else {checkrb()}
		function checkrb(){
			if (typeof rpdb[bfunc] == 'function') {
				rpdb[bfunc](req,req.body,start);
			} else { start ()}
		}	
		function start(err){
			if (err) {rdbcb({error:err},'')};
			client_PGI = dbs.getclient(dbcon);
			client_PGI.connect(dbconncb)
		}
	},
	update: function(req,table,primary_key,table_structure,dbcon,rediscon,rdbcb){
		function updaterecord(){
			function qccb(error,message){
				client_PGI.end()
				if (error){
					console.log({error:'rapid - update error',errmsg:error});
					rdbcb({error:'rapid - update error',errmsg:error},'');
				}else{
					function last(err){
					if (err){rdbcb({error:table+' after-error',errmsg:err});
					} else {if (!message.rows[0]){rdbcb('',{})}else{
						rdbcb('',message.rows[0])}};
					};
					var afunc = table+'Update'
					if (typeof rpda[afunc] == 'function') {
						rpda[afunc](req,message.rows[0],last);
					} else {last()}
				}
			}
			var key_value = req.query[primary_key]
			var upd_fields = dbs.get_fields(table_structure,primary_key,req.body,0,table) 
			if(!upd_fields.rapidinsertfields_error){
				var key_value = upd_fields[primary_key];
				delete upd_fields[primary_key]
				dbs.update(client_PGI,table,primary_key,key_value,upd_fields,0,qccb);
			} else {rdbcb(upd_fields.rapidinsertfields_error,'')};
		}
		function dbconncb (error,message){
			if (error){
				client_PGI.end()
				console.log({error:'rapid database connection error/'+dbcon.rapiddb});
				return rdbcb({error:'rapid database connection error/ '+dbcon.rapiddb},"");
			}else{
				updaterecord();
			};
		};
		// implement before
		var bfunc = table+'Update'
		var client_PGI = {}
		if (typeof rpdb.checkAll == 'function'){
			rpdb.checkAll(req,req.query,checkrb);
		} else {checkrb()}
		function checkrb(){
			if (typeof rpdb[bfunc] == 'function') {
				rpdb[bfunc](req,req.body,start);
			} else { start ()}
		}	
		function start(err){
			if (err) {rdbcb({error:err},'')};
			client_PGI = dbs.getclient(dbcon);
			client_PGI.connect(dbconncb)
		}

	},
	destroy: function(req,table,primary_key,table_structure,dbcon,key_value,rediscon,rdbcb){
		function deleterecord(){
			function qccb(error,message){
				client.end()
				if (error){
					rdbcb({error:'rapid - delete error',errmsg:error},'');
				}else{
					var deletemessage = {table:table,
							 primary_key:primary_key,
							 key_value:key_value,
							 action:'DELETE',
							 success:true
							 }
					if (!message.rows[0]){
						deletemessage.success = false
						deletemessage.error = 'key not found!'
					}
					    function last(err){
						if (err){rdbcb({error:table+' after-error',errmsg:err});
						} else {if (!message.rows[0]){rdbcb('',{})}else{
							rdbcb('',deletemessage)}};
					    };
					    var afunc = table+'Delete'
					    if (typeof rpda[afunc] == 'function') {
						rpda[afunc](req,deletemessage,last);
					    } else {last()}
				}
			}
			if (!table_structure.deleted){
				var sqlstat = "delete from "+table+" where " + primary_key +" = $1 RETURNING *";
			} else {
				var sqlstat = "update "+table+" set deleted = true where " + primary_key +" = $1 RETURNING *";
			};
			var qval = []
			qval.push(key_value)
			dbs.runquery(client,sqlstat,qval,0,qccb);
		}
		function dbconncb (error,message){
			if (error){
				client.end()
				console.log({error:'rapid database connection error/'+dbcon.rapiddb});
				return rdbcb({error:'rapid database connection error/ '+dbcon.rapiddb},"");
			}else{
				deleterecord();
			};
		};
		// implement before
		var bfunc = table+'Delete'
		var client = {}
		if (typeof rpdb.checkAll == 'function'){
			rpdb.checkAll(req,req.query,checkrb);
		} else {checkrb()}
		function checkrb(){
			if (typeof rpdb[bfunc] == 'function') {
				rpdb[bfunc](req,req.query,start);
			} else { start ()}
		}	
		function start(err){
			if (err) {rdbcb({error:err},'')};
			client = dbs.getclient(dbcon);
			client.connect(dbconncb)
		}
	},
	dataset: function(req,dstype,rdbcb){
		function dscallback(err,msg){
			if (err){
				rdbcb(err,'');
			}else {
				rdbcb('',msg)};
		};
		function closeconn(error,message){
			if (Object.keys(open_connections).length>0){;
				connexion_name = Object.keys(open_connections)[0]
				if (!dstype){
					open_connections[connexion_name].end()
					delete open_connections[connexion_name];
					closeconn(error,message);
				} else {
					if (error){
						var transact = 'rollback'
					} else {var transact = 'commit'};

					function conncallback (cerror,cmessage){
						open_connections[connexion_name].end()
						delete open_connections[connexion_name];
						if (cerror){
							return closeconn({error:error,connection:connexion_name,action:transact},'')
						} else {closeconn(error,message)};
					};
					dbs.transaction(open_connections[connexion_name],transact,conncallback);
				//
				};	
			} else { return dscallback(error,message)};

		};
		var connexion_name = ""
		var record_action = 0
		var current_table_position = 0
		var open_connections       = {}
		var res_message = {}
		var rcfg  = process.rapidcfg;
		if (!req.body.data){return dscallback({error:"Your JSON request should contain an object called:data"},'')};
		var req_data = req.body.data
		if (req_data.constructor !== Object){return dscallback({error:"Json request: data - is not an Object"},'')};
		var transaction_tables 	   = Object.keys(req_data)
		if (transaction_tables.length == 0){return dscallback({error:"Json request: data - has no tables objects"},'')};
		
		function next_table (err,message){
			if(err){
				return closeconn(err,'');
				} else {
				current_table_position = current_table_position + 1	
				if (transaction_tables[current_table_position] == undefined){
					return closeconn('',{data:res_message})
				} else {table_cu(req,transaction_tables[current_table_position],next_table)}		
			}
		};
		function table_cu(req,table_x,next){
			var primary_key = rcfg.mdb.tables.keys[table_x]
			var table_structure = rcfg.mdb.tables.structures[table_x]
			function table_set_request (req,table_x,connobj,connname,next){
				function tnext_record(err,message){
					if (!res_message[table_x]){res_message[table_x] = []};
 					var rec_result = req.body.data[table_x][curent_record];
					delete rec_result.deleted
					delete rec_result.alta
					delete rec_result.createdAt
					delete rec_result.updatedAt
					if (err) {
						if (!res_message.errors){res_message.errors = []};
						errmsg = {connexion:connexion_name,
							database:rcfg.mdb.tables.db[table_x],
							table:table_x,
							error:err,
							record:curent_record,
							request:req.body.data[table_x][curent_record]}
						res_message.errors.push(errmsg);
						rec_result.rpdstatus = 9;
						if (dstype) {return next({error:res_message.errors},'')};
					} else {
						if (record_action != -1) {rec_result.rpdstatus = 0};
					};
					if (record_action != -1) {
						res_message[table_x].push(rec_result);
					} else {
						if (!res_message.deleted){res_message.deleted = {}};
						if (!res_message.deleted[table_x]){res_message.deleted[table_x] = []};
						res_message.deleted[table_x].push(rec_result);
					};
					curent_record = curent_record + 1;
					return table_record(table_x,connobj,tnext_record)
				}				
				function table_record(table_x,connobj,rnext){
					function querycb(error,message){
						if (error){return rnext(error,'');
						} else {return rnext('',message)} ;
						
					}
					if (req.body.data[table_x].length < (curent_record+1)){
						next('','message');
					} else {
						var rec_status = req.body.data[table_x][curent_record].rpdstatus
						record_action = rec_status
						if (rec_status == undefined){return rnext({error:'rpdstatus - field not found'},'')};
						switch (rec_status) {
						case 1: 
							
						    function tinsert_record(){
							var key_value = req.body.data[table_x][curent_record][primary_key];
							var c_record = req.body.data[table_x][curent_record];
							delete c_record.rpdstatus;
							var ins_fields = dbs.get_fields(table_structure,primary_key,c_record,1,table_x); 
							if(key_value){ins_fields[primary_key] = key_value}
							if(!ins_fields.rapidinsertfields_error){
								dbs.insert(connobj,table_x,ins_fields,0,rnext);
							} else {rnext(ins_fields.rapidinsertfields_error,'')};
						    }
						    var bfunc = table_x+'Create'
						    if (typeof rpdb.checkAll == 'function'){
							rpdb.checkAll(req,req.query,checkrb1);
							} else {checkrb1()}
						    function checkrb1(){
					  		    if (typeof rpdb[bfunc] == 'function') {
								rpdb[bfunc](req,req.body.data[table_x][curent_record],tinsert_record);
							    } else { tinsert_record()}
						    }						    
						    break;
						case 2:
							var key_value = req.body.data[table_x][curent_record][primary_key]
							if (key_value==undefined){return rnext({error:'invalid primary key ' + primary_key},'')};
						    function tupdate_record(){
							var c_record = req.body.data[table_x][curent_record]
							delete c_record.rpdstatus
							var upd_fields = dbs.get_fields(table_structure,primary_key,c_record,0,table_x)
							if(!upd_fields.rapidinsertfields_error){
							  var key_value = req.body.data[table_x][curent_record][primary_key]
							  dbs.update(connobj,table_x,primary_key,key_value,upd_fields,0,rnext);
							} else {rnext(upd_fields.rapidinsertfields_error,'')};
						    }
						    var bfunc = table_x+'Update'
						    if (typeof rpdb.checkAll == 'function'){
								rpdb.checkAll(req,req.query,checkrb);
							} else {checkrb()}
						    function checkrb(){
					  		    if (typeof rpdb[bfunc] == 'function') {
								rpdb[bfunc](req,req.body.data[table_x][curent_record],tupdate_record);
							    } else { tupdate_record()}
						    } 	
						    break;						
						case -1:
							var key_value = req.body.data[table_x][curent_record][primary_key]
							if (key_value==undefined){return rnext({error:'invalid primary key ' + primary_key},'')};
							if (!table_structure.deleted){
								var sqlstat = "delete from "+table_x+" where " + primary_key +" = $1 RETURNING *";
							} else {
								var sqlstat = "update "+table_x+" set deleted = true where " + primary_key +" = $1 RETURNING *";
							};
							var qval = []
							qval.push(key_value)
							dbs.runquery(connobj,sqlstat,qval,0,rnext);
							break;
						default: rnext({error:'rpdstatus'+rec_status+'not implemented!'},'');
						};	
					}				
				};				
				var table_response = []
				var curent_record = 0		
				table_record(table_x,connobj,tnext_record)
			};		
			function dbconncb (error,message){
				if (error){
					open_connections[connexion_name].end()
					console.log({error:'rapid database connection error/'+new_connexion_name});
					return closeconn({error:'rapid database connection error/ '+new_connexion_name},"");
				}else{
					connexion_name = new_connexion_name
					function conncallback (error,message){
						if (error){
							return closeconn({error:error,connection:connexion_name},'')
						} else {table_set_request(req,table_x,open_connections[connexion_name], connexion_name, next_table)};
					};
					if (dstype) {
						console.log('transaction mode for' + connexion_name)
						dbs.transaction(open_connections[connexion_name],'begin transaction',conncallback);
					} else {
					table_set_request(req,table_x,open_connections[connexion_name],connexion_name,next_table)};
				};
			};
			function set_connection(connname,conobj){
				open_connections[connname] = dbs.getclient(conobj)
				open_connections[connname].connect(dbconncb)
			};
			var dbcon = {};
			var base_db = rcfg.mdb.tables.db[table_x];
			if (rcfg.distributeddata == 1 && rcfg.mdb.databases[base_db].distributeddata==1){
					var dist_db = dbs.getdbdist(base_db,req.token.user);
					dbcon = rcfg.mdb.connections[dist_db];
					dbcon.rapiddb = dist_db
				} else {dbcon = rcfg.mdb.databases[base_db];dbcon.rapiddb = base_db};				
			var new_connexion_name = dbcon.rapiddb
			if (open_connections[new_connexion_name]){
				if (new_connexion_name != connexion_name){
					open_connections[new_connexion_name].connect(dbconncb);
				} else {table_set_request(req,table_x,open_connections[connexion_name],connexion_name,next_table)};
			} else {set_connection(new_connexion_name,dbcon)};
		};
		if (!req.body.data){return dscallback({error:"DATA object not found!"},'')}
		for (table_x in req.body.data){
			if (utils.findin(rcfg.mdb.tables.names,table_x)){
				var table_xtype = req.body.data[table_x].constructor
				if (table_xtype !== Array){return dscallback({error:'Table:'+table_x + ' - should be represented as an Array in request JSON!',table:table_x,requestpart:req.body.data[table_x]},'')};
			}else {return dscallback({error:'Table:'+table_x + ' - not found in databases!'},'')};
				if (req.body.data[table_x].length == 0){return dscallback({error:'Table:'+table_x + ' - has no records',table:table_x,requestpart:req.body.data[table_x]},'')};
		}
		table_cu(req,transaction_tables[0],next_table)
	}
}
