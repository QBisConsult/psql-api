var dbs   = require('./dbcon.js');
var utils = require('./fgen.js');
var ed = require('./ncrypto.js');
var rdb   = require('./rapidpg.js');
var pg    = require('pg');
var fs    = require('fs');
var cto   = require('./pgt.js');
var rpda  = require('./rpdafter.js');
var rpdb  = require('./rpdbefore.js');
var pem   = require('./cesmod.js');
var crc	  = require('buffer-crc32');
var jwt   = require('jsonwebtoken');

module.exports = {
	deletesql: function(req,res){
		if (!req.body){return res.status(404).send({error:"body data required"})}
		if (!req.body.id){return res.status(404).send({error:"id is required"})}
		function final(err,rsp){
			if (err){return res.status(404).send({error:err})}
			if (req.body.inuse == false){
				delete process.rapidcfg.mdb.esqls[req.body.queryname]
			} else {
				delete process.rapidcfg.mdb.sqls[req.body.queryname]
			}
			return res.send({message:rsp})
		};
		function cb(err,data){
			//console.log(err);
			client.query("delete from sqls where id = $1",[req.body.id],function(err, result){
				client.end();
				if (err) {
					return final({message:"error",error:"can not delete",errmsg:err});
				};
				final(false,result);
			});
		};
		var pars = utils.getdbpar();
		var client = dbs.getclient(pars);
		client.connect(cb)
	},
	saveiplist: function(req,res){
		//console.log(req.body.aip)
		var file = req.body.aip;
		process.rapidcfg.ipallow = JSON.parse(req.body.aip);
		fs.writeFileSync(process.env.mpath+'ipallow.json',file);
		res.send({message:"OK"});
	},
	ipallowlist: function(req,res){
		var ret = {};
		ret.ip  = utils.reqip(req);
		ret.aip = process.rapidcfg.ipallow;
		return res.send(ret);
	},
	loadtokens:function(req,res){
		function final(err,data){
			client.end();
			if (err){return res.status(404).send({message:"error",error:err})};
			data.rows.forEach(function(row){
				row.jwt = 'Bearer '+jwt.sign(JSON.parse(row.token),process.env.token_key);
			});
			res.send({message:"OK",tokens:data.rows});
		};
		function cb(err,data){
			if (err){return res.status(404).send({message:"error",error:"can not connect the database"})};
			dbs.runquery(client,"select * from tokens order by tname",[],'json',final);
		};
		var pars = utils.getdbpar();
		var client = dbs.getclient(pars);
		client.connect(cb)
	},
	savetoken: function(req,res){
		if (!req.body.id){return res.status(404).send({message:"error",error:"incomplete request - tkid"})}
		if (!req.body.tname){return res.status(404).send({message:"error",error:"incomplete request - tkname"})}
		if (!req.body.token){return res.status(404).send({message:"error",error:"incomplete request - token"})}
		function final(err,data){
			console.log(err);
			console.log(data);
			client.end();
			if (err){return res.status(404).send({message:"error",error:err})};
			data.forEach(function(row){
				row.jwt = 'Bearer '+jwt.sign(JSON.parse(row.token),process.env.token_key);
			});
			res.send({message:"OK",saved:data});
		};
		function cb(err,data){
			if (err){return res.status(404).send({message:"error",error:"can not connect the database"})};
			if (req.body.id=='new'){
				isnew = true;
				req.body.id = utils.uuid();
			};
			if(isnew){
				req.body.createdAt = utils.timeymd();
				req.body.updatedAt = utils.timeymd();
				dbs.insert(client,'tokens',req.body,'json',final)
			} else {
			req.body.updatedAt = utils.timeymd();
			dbs.update(client,'tokens','id',req.body.id,req.body,'json',final)}
		};
		var isnew = false;
		var pars = utils.getdbpar();
		var client = dbs.getclient(pars);
		client.connect(cb)
	},
	pubjs: function(req,res){
		if (!req.body.fid){return res.status(404).send({message:"error",error:"incomplete request"})}
		var ce = req.body.fid;
		var file = fs.readFileSync(process.env.mpath+'js/jsedit-psql/'+ce+'.js');
		fs.writeFileSync('js/'+ce+'.js',file);
		res.send({message:"OK"});
		process.exit(9);
	},
	checkjs: function(req,res){
		//console.log(req.body);
		
		if (!req.body.fid){return res.status(404).send({message:"error",error:"incomplete request"})}
		var ce = req.body.fid;
		var exec = require('child_process').exec;
		var fs = require('fs');
		var child = "";
		var msgsend = false;
		var file = fs.readFileSync(process.env.mpath+'js/jsedit-psql/'+ce+'.js');
		fs.writeFileSync('js/testjs.js',file);
		child = exec('node js/test2.js');
		child.stdout.on('data', function(data) {
		    //console.log(data);
		});
		child.stderr.on('data', function(data) {
		    //console.log(data);
		    return res.status(404).send({message:"error",error:data})
		});
		child.on('close', function(code) {
		    if (code === 0){res.send({message:"OK"})};
		});
	},
	savemode: function(req,res){
		//console.log('savemode:',req.body);
		if (req.body.p0===null){return res.status(404).send({message:"error",error:"incomplete request"})}
		if (req.body.p1<80){return res.status(404).send({message:"error",error:"incomplete request"})}
		if (req.body.p2===null){return res.status(404).send({message:"error",error:"incomplete request"})}
		if (req.body.p3===null){return res.status(404).send({message:"error",error:"incomplete request"})}
		var c = { 
		  development:!req.body.p2,
		  devssl:req.body.p3,
		  port:req.body.p1,
		  start:req.body.p0
		}
		fs.writeFileSync(process.env.mpath+'env.json', JSON.stringify(c,null,2));
		process.rapidcfg.env = c;
		res.send({message:"OK"});
		process.exit(9);
	},
	savessl: function(req,res){
		//console.log(req.body);
		if (!req.body.c){return res.status(404).send({message:"error",error:"incomplete request"})}
		if (!req.body.k){return res.status(404).send({message:"error",error:"incomplete request"})}
		pem.readcertificate(req.body.c, read)
		function read(err,crt){
			if (err){return res.send({message:"error",error:"invalid certificate"})}
			pem.readpubkey(req.body.k,final)
		};
		function final(err,data){
			if (err){return res.send({message:"error",error:"invalid key"})}
			var oldcrt = fs.readFileSync(process.env.mpath+'ssl/service.crt').toString();
			var oldkey = fs.readFileSync(process.env.mpath+'ssl/service.key').toString();
			fs.writeFileSync(process.env.mpath+'ssl/bkp/service.crt', oldcrt);
			fs.writeFileSync(process.env.mpath+'ssl/bkp/service.key', oldkey);
			fs.writeFileSync(process.env.mpath+'ssl/service.crt', req.body.c);
			fs.writeFileSync(process.env.mpath+'ssl/service.key', req.body.k);
			res.send({message:"OK"})
			//console.log('exit');
			process.exit(9);
		};
	},
	getsslinfo: function(req,res){
		var d1 = new Date()
		var d2 = new Date()
		var crt = fs.readFileSync(process.env.mpath+'ssl/service.crt').toString()
		pem.readcertificate(crt, read)
		function read(err,crt){
			d1.setTime(crt.validity.start);
			crt.validity.start = d1;
			d2.setTime(crt.validity.end);
			crt.validity.end = d2;
			return res.send({message:"OK",certificate:crt})
		};
	},
	savetpwd: function(req,res){
		if (!req.body.tk){return res.status(404).send({message:"error",error:"incomplete request"})}
		process.rapidcfg.etk = ed.enc(req.body.tk);
		process.env.token_key = req.body.tk;
		var c = {
			userapid:true,
			host:process.rapidcfg.host,
			port:process.rapidcfg.port,
			user:process.rapidcfg.user,
			password:process.rapidcfg.password,
			rapiddb:process.rapidcfg.rapiddb,
			rapidid:process.rapidcfg.rapidid,
			suser:process.rapidcfg.suser,
			spwd:process.rapidcfg.spwd,
			isnew:process.rapidcfg.isnew,
			etk:process.rapidcfg.etk
		};
		fs.writeFileSync(process.env.mpath+'config.json', JSON.stringify(c,null,2));
		return res.send({message:"OK"});
		
	},
	putjs: function(req,res){
		if (!req.body.fid){return res.status(404).send({message:"error",error:"incomplete request"})}
		if (!req.body.file){return res.status(404).send({message:"error",error:"incomplete request"})}
		function writefile(err,data){
			if (err){return res.status(404).send({message:"error",error:err})}
			return res.send({message:"OK",file:data})
		};
		fs.writeFile(process.env.mpath+'js/jsedit-psql/'+req.body.fid+'.js', req.body.file, writefile)
	},
	getjs: function(req,res){
		var ce = req.query.atr;
		var fl1 = "";
		function readback2(err,filedata2){
			if (err){return res.status(404).send({message:"error",error:err})};
			var checkcrc = false;
			var c1 = crc.unsigned(fl1);
			var c2 = crc.unsigned(filedata2);
			if (c1==c2){checkcrc = true}
			return res.send({message:"OK",file:fl1.toString(),okcrc:checkcrc})
		};
		function readback1(err,filedata1){
			if (err){return res.status(404).send({message:"error",error:err})};
			fl1=filedata1;
			fs.readFile('js/'+ce+'.js', readback2)
		};
		fs.readFile(process.env.mpath+'js/jsedit-psql/'+ce+'.js', readback1)
	},	
	reset: function(req,res){
		res.send({message:"OK",reset:"now"});
		process.exit(9);		
	},
	validatesql: function(req,res){
		//console.log(req.body);
		function final(err,result){
			if (err){return res.status(404).send(err)};
			var mts = process.rapidcfg.mdb.esqls[req.body.queryname];
			mts.inuse = true;
			process.rapidcfg.mdb.sqls[req.body.queryname] = mts;
			delete process.rapidcfg.mdb.esqls[req.body.queryname] //delete ;
			//console.log(process.rapidcfg.mdb.sqls);
			return res.send({message:"OK",result:result});
		};
		function cb(err,data){
			if (err){client.end();return res.send({message:"error",error:"can not connect the database server"})}
				var values = []
				var inuse = true;
				var updatedAt = utils.timeymd();
				values.push(inuse);
				values.push(updatedAt);
				values.push(req.body.id);
				
			sqlstat ='UPDATE sqls SET (inuse,"updatedAt") = ($1,$2) WHERE id = $3 RETURNING *'
			client.query(sqlstat,values,function(err, result){
				client.end();
				if (err) {
					return final({message:"error",error:"can not load information",errmsg:err});
				};
				final(false,result);
			});
		};
		
		var cstring = "postgres://"+process.rapidcfg.user+":"+process.rapidcfg.password+"@"+process.rapidcfg.host+":"+process.rapidcfg.port+"/"+process.rapidcfg.rapiddb
		//console.log(cstring);
		var client = new pg.Client(cstring);
		client.connect(cb);
	},
	rpdquery: function(req,res){
		var rcfg  = process.rapidcfg;
		var query = req.query;
		var iserr   = false;
		function rdbcb(err,response){
			if (err) {
				if (!iserr){
				res.status(404).send(err)}
				
				iserr   = true;
				return -1;
				}
			if (!iserr) {
				var testtoken = {
					user:'test',
					email:'test@test.com'
				}
				var testjwt = jwt.sign(testtoken,process.env.token_key);
				response.testtoken = testjwt;
				return res.send(response);
			};
		};
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
		if (!rcfg.mdb.esqls[query.csql]) {
			if (!rcfg.mdb.sqls[query.csql]){
				return rdbcb(seterror('Query:'+query.csql,'Query does not exist!',1),'')
				} else {var sqlstat = rcfg.mdb.sqls[query.csql].sqlstat;
			};
		} else {var sqlstat = rcfg.mdb.esqls[query.csql].sqlstat};
		query.limit = 10;
		query.offset = 0;
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
		if (!iserr){	
			function dbconncb (error,message){
				if (error){
					client.end()
					return rdbcb({error:'rapid database connection error/ '+dbcon.rapiddb},"");
				}else{
					arr.forEach(function(item){
						qp[item]= query[item];	
					});
					dbs.getsql(client,sqlstat,qp,query.limit,query.offset,qccb);
				};
			};
			var dbcon  = {}
			var dbname = ""
			if (rcfg.mdb.databases.number == 1){
				dbname = rcfg.mdb.databases.names[0];
			} else {
				if (rcfg.mdb.esqls[query.csql]){
					dbname = rcfg.mdb.esqls[query.csql].database;
				} else {
					if (rcfg.mdb.sqls[query.csql]){
						dbname = rcfg.mdb.sqls[query.csql].database;
					} else {
					err = seterror('invalid parameter/ csql',query.csql +' SELECT STAT. - does not exist or is not in use',0);
					return rdbcb(err,'')};
				};
					
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
		
			// implement before
			var bfunc = query.csql+'RunSql'
			var client = {}
			if (typeof rpdb[bfunc] == 'function') {
				rpdb[bfunc](req,req.query,start);
			} else { start ()}
			function start(err){
				if (err) {return rdbcb({error:err},'')};
				client = dbs.getclient(dbcon);
				client.connect(dbconncb)
			}
		}
	},
	savesql: function(req,res){
		if (!req.body){return res.status(404).send({message:"error",error:"csql data required"})};
		if (!req.body.queryname){return res.status(404).send({message:"error",error:"queryname required"})};
		if (!req.body.sqlstat){return res.status(404).send({message:"error",error:"sqlstat required"})};
		if (!req.body.db){return res.status(404).send({message:"error",error:"db required"})};
		if (!req.body.id){return res.status(404).send({message:"error",error:"id required"})};
		function final(err,response){
			if(err){return res.send(err)};
			var psd = utils.findobjectbyval(process.rapidcfg.mdb.esqls,"id",req.body.id);
			if(psd.length === 0){
				psd = utils.findobjectbyval(process.rapidcfg.mdb.sqls,"id",req.body.id);
			}
			//console.log(psd);
			delete process.rapidcfg.mdb.esqls[psd[0].objname];
			delete process.rapidcfg.mdb.sqls[psd[0].objname];
			process.rapidcfg.mdb.esqls[req.body.queryname] = {
				id : req.body.id,
				database:req.body.db,
				inuse:false,
				sqlstat:req.body.sqlstat,
				dbtype:'pg'}
			if(response){return res.send({message:"OK",item:process.rapidcfg.mdb.esqls[req.body.queryname],rsp:response})};
		};
		function cb(err,data){
			if (err){client.end();return res.status(404).send({message:"error",error:"can not connect the database server"})}
				var values = []
				var sqlname = req.body.queryname.toLowerCase();
				var sqlstat = req.body.sqlstat;
				var inuse = false;
				var updatedAt = utils.timeymd();
				var dbid = process.rapidcfg.mdb.databases[req.body.db].id;
				values.push(sqlname);
				values.push(sqlstat);
				values.push(inuse);
				values.push(updatedAt);
				values.push(dbid);
				values.push(req.body.id);
				
			sqlstat ='UPDATE sqls SET (sqlname,sqlstat,inuse,"updatedAt",dbid) = ($1,$2,$3,$4,$5) WHERE id = $6 RETURNING *'
			//console.log(sqlstat);
			client.query(sqlstat,values,function(err, result){
				client.end();
				if (err) {
					return final({message:"error",error:"can not load information",errmsg:err});
				};
			final(false,result);
			});
		};
		var cstring = "postgres://"+process.rapidcfg.user+":"+process.rapidcfg.password+"@"+process.rapidcfg.host+":"+process.rapidcfg.port+"/"+process.rapidcfg.rapiddb
		//console.log(cstring);
		var client = new pg.Client(cstring);
		client.connect(cb);
		
		
	},
	newsql: function(req,res){
		if (!req.body){return res.status(404).send({message:"error",error:"csql data required"})};
		if (!req.body.queryname){return res.status(404).send({message:"error",error:"queryname required"})};
		if (!req.body.sqlstat){return res.status(404).send({message:"error",error:"sqlstat required"})};
		if (!req.body.db){return res.status(404).send({message:"error",error:"db required"})};
		if (!req.body.id){return res.status(404).send({message:"error",error:"id required"})};
		req.body.queryname = req.body.queryname.toLowerCase();
		var newid = utils.hash(req.body.queryname,26)
		if (!process.rapidcfg.mdb.databases[req.body.db].id){return res.status(404).send({message:"error",error:"invalid db "+req.body.db})};
		function final(err,response){
			if(err){return res.status(404).send(err)};
			process.rapidcfg.mdb.esqls[req.body.queryname] = {
				id:newid,
				database:req.body.db,
				inuse:false,
				sqlstat:req.body.sqlstat,
				dbtype:'pg'}
			if(response){return res.send({message:"OK",item:process.rapidcfg.mdb.esqls[req.body.queryname],rsp:response})};
		};
		function cb(err,data){
			if (err){client.end();return res.status(404).send({message:"error",error:"can not connect the database server"})}
			var f = {id:newid,
				sqlname:req.body.queryname.toLowerCase(),
				sqlstat:req.body.sqlstat,
				inuse:false,
				createdAt:utils.timeymd(),
				updatedAt:utils.timeymd(),
				deleted:false,
				dbid:process.rapidcfg.mdb.databases[req.body.db].id}
			sqlstat ='insert into sqls (id,sqlname,sqlstat,inuse,"createdAt", "updatedAt",deleted,dbid)';
			sqlstat = sqlstat + " values ("+utils.k2l(f)+")";
			console.log(sqlstat);
			client.query(sqlstat,function(err, result){
				client.end();
				if (err) {
					return final({message:"error",error:"can not load information",errmsg:err});
				};
			final(false,result);
			});
		};
		var cstring = "postgres://"+process.rapidcfg.user+":"+process.rapidcfg.password+"@"+process.rapidcfg.host+":"+process.rapidcfg.port+"/"+process.rapidcfg.rapiddb
		//console.log(cstring);
		var client = new pg.Client(cstring);
		client.connect(cb);
	},
	adddbs: function(req,res){
		if (!req.body){return res.status(404).send({message:"error",error:"dbname is required"})};
		if (!req.body.dbname){return res.send({message:"error",error:"dbname is required"})};
		function cb(err,data){
			function final(err,result){
				sclient.end();
				sclient = {};
				//console.log(err);
				if (err){return res.send(err)} else {
				return res.send({message:"OK",result:result})};
			}
			function cbs(err,data){
				if (err){return res.status(404).send({message:"error",error:"can not connect the database server"})};
				sqlstat ='insert into dbs (id,cfgid,database,dbtype,host, port,user_,password,"createdAt", "updatedAt",distributeddata)';
				sqlstat = sqlstat + " values ('"+utils.hash(req.body.dbname.toLowerCase(),26)+"','default','"+req.body.dbname+"','pg','"+process.rapidcfg.host+"',"+process.rapidcfg.port+",'"+ process.rapidcfg.user+"','"+process.rapidcfg.password+"','" + utils.timeymd() +"','"+utils.timeymd()+"',0)";
				//console.log(sqlstat);
				sclient.query(sqlstat,function(err, result) {
					if (err) {
						final({message:"error",error:"can not insert db record",errmsg:err});
					} else {final(false,result)};
					});
			};
		
		
			client = {};
			if (err){return res.status(404).send({message:"error",error:"can not connect the database server"})};
			var cstring = "postgres://"+process.rapidcfg.user+":"+process.rapidcfg.password+"@"+process.rapidcfg.host+":"+process.rapidcfg.port+"/"+process.rapidcfg.rapiddb;
			//console.log(cstring);
			var sclient = new pg.Client(cstring);
			sclient.connect(cbs);
		};
		var cstring = "postgres://"+process.rapidcfg.user+":"+process.rapidcfg.password+"@"+process.rapidcfg.host+":"+process.rapidcfg.port+"/"+req.body.dbname;
		//console.log(cstring);
		var client = new pg.Client(cstring);
		client.connect(cb);	
	},
	getdbs:function(req,res){
		function final(err,result){
			if (err) {return res.status(404).send({message:"error",error:"can not connect the database server"})}
			//console.log(result)
			var dbs = [];
			result.rows.forEach(function(db){
				//console.log(db.datname);
				//if (db.datname != "postgres"){if (db.datname != "rdsadmin"){dbs.push(db.datname)}};
				if (db.datname != "postgres" && db.datname != "rdsadmin" && db.datname != "rcfg"){dbs.push(db.datname)}
			})
			return res.send({message:"OK",data:dbs});
		};
		function cb(err,data){
			if (err){client.end();return res.status(404).send({message:"error",error:"can not connect the database server"})}
			var sqlstat = "SELECT datname FROM pg_database WHERE datistemplate = false";
			client.query(sqlstat,function(err, result) {
				client.end();
				if (err) {
					return final({message:"error",error:"can not load information",errmsg:err});
				};
			final(false,result);
			});
		};
		var cstring = "postgres://"+process.rapidcfg.user+":"+process.rapidcfg.password+"@"+process.rapidcfg.host+":"+process.rapidcfg.port+"/"+process.rapidcfg.rapiddb
		//console.log(cstring);
		var client = new pg.Client(cstring);
		client.connect(cb);
	},
	getmdb:function(req,res){
		//console.log('getmdb hit');
		var copt = {domain:process.rapidcfg.host,
					port:process.rapidcfg.port,
					db:"",usern:process.rapidcfg.user,pwd:""}
		if (process.rapidcfg.mdb){
			var nsd  = JSON.stringify(process.rapidcfg.mdb);
			var nobj = JSON.parse(nsd);
			//console.log(nobj);
			nobj.databases.names.forEach(function(dbs){
				delete nobj.databases[dbs].user;
				delete nobj.databases[dbs].password;
			})
			nobj.host   = process.rapidcfg.host;
			nobj.port   = process.rapidcfg.port;
			nobj.dbuser = process.rapidcfg.user;
			//console.log(JSON.stringify(nobj));
			return res.send({result:"OK",mdb:nobj,env:process.rapidcfg.env});
		} else {return res.status(404).send({error:"can not connect the database server",copt:copt})};
	},
	reload:function(req,res,cfg){
		process.rapidcfg.mdb={};
		var copt = {domain:process.rapidcfg.host,
					port:process.rapidcfg.port,
					db:"",usern:process.rapidcfg.user,pwd:""}
		function result(){
			if (process.rapidcfg.mdb){
				var nsd  = JSON.stringify(process.rapidcfg.mdb);
				var nobj = JSON.parse(nsd);
				//console.log(nobj);
				nobj.databases.names.forEach(function(dbs){
					delete nobj.databases[dbs].user;
					delete nobj.databases[dbs].password;
				})
				nobj.host   = process.rapidcfg.host;
				nobj.port   = process.rapidcfg.port;
				nobj.dbuser = process.rapidcfg.user;
				return res.send({result:"OK",mdb:nobj});
			} else {return res.status(404).send({error:"can not connect the database server",copt:copt})};
			//console.log(JSON.stringify(process.rapidcfg));
		}
		function cb(err,data){
			client.end()
			client = {};
			if (err){
				if (err.routine){
						if (err.routine == 'auth_failed'){
							errmsg ="Invalid password or username";
						};
						if (err.routine == 'InitPostgres'){
							errmsg ="Invalid database name";
						};
					} else {
						if (err.errno == 'ECONNREFUSED'){
							errmsg ="Invalid domain address or port";
						};
						if (err.errno == 'ENOTFOUND'){
							errmsg ="Invalid domain address or port";
						};
				}
				return res.status(404).send({error:errmsg,errdata:err,copt:copt})};
			cfg.loadmdb(process.rapidcfg,result);
		}
		var c = process.rapidcfg;
		var cstring = "postgres://"+c.user+":"+c.password+"@"+c.host+":"+c.port+"/"+c.rapiddb
		var client = new pg.Client(cstring);
		client.connect(cb);
	}
}

