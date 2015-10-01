var utils = require('./fgen.js')

module.exports = {
	init:function(options,cdata,cfgdata,next){
		var cstring = "postgres://"+options.user+":"+options.password+"@"+options.address+":"+options.port+"/"
		console.log(cstring);
		console.log("postgres://postgres:1234@localhost:5433/")
		function ckdb(data){console.log(data)};
		function createdata(){
			function cdstruct(){
				function insertdefaults(){
					 sqlstat = "insert into config (id,distributeddata,distributedcache,usewaterline,usr,pwd) values ('default',0,0,0,'administrator','admin');";
					 sqlstat = sqlstat + 'insert into dbs (id,cfgid,database,dbtype,host, port,user_,password,"createdAt", "updatedAt",distributeddata)';
					 sqlstat = sqlstat + " values ('db1','default','"+cdata+"','pg','"+options.address+"',"+options.port+",'"+ options.user+"','"+options.password+"','" + utils.timeymd() +"','"+utils.timeymd()+"',0)";
					 client.query(sqlstat,function(err, result) {
						if (err) {
							return next({dbconf:"error",error:"can not insert defaults",errmsg:err});
						};
						next(false,result);
					 });
				};
				function createtables(err,data){
					if(err){
						return next({dbconf:"error",error:"can not connect "+cfgdata+" database",errmsg:err});
					}
					console.log('tables');
					var sqlstat = 'CREATE TABLE config (id character varying(32) NOT NULL,distributeddata integer, distributedcache integer,usewaterline integer,usr character varying(128),pwd character varying(128),CONSTRAINT cfgid PRIMARY KEY (id)); CREATE TABLE db_servers (id character varying(32) NOT NULL,  dbsid character varying(32),extname character varying(32),host character varying(128), user_ character varying(128), password character varying(128), "createdAt" timestamp without time zone, "updatedAt" timestamp without time zone,port integer, CONSTRAINT srvid PRIMARY KEY (id));CREATE TABLE dbs (id character varying(32) NOT NULL,cfgid character varying(32),database character varying(24),dbtype character varying(15),host character varying(128),port integer,user_ character varying(128),password character varying(128),"createdAt" timestamp without time zone, "updatedAt" timestamp without time zone, distributeddata integer,CONSTRAINT dbsid PRIMARY KEY (id)); CREATE TABLE redis_servers (id character varying(32) NOT NULL,cfgid character varying(32),ext character varying(14),host character varying(128), port integer, protected integer,password character varying(128),"createdAt" timestamp without time zone,"updatedAt" timestamp without time zone, CONSTRAINT rdsid PRIMARY KEY (id));CREATE TABLE sqls (id character varying NOT NULL,sqlname character varying,sqlstat text,samplerequest text,inuse boolean,"createdAt" timestamp without time zone, "updatedAt" timestamp without time zone,deleted boolean,dbid character varying,CONSTRAINT sqlid PRIMARY KEY (id)); CREATE TABLE tokens (id character varying NOT NULL,tname character varying,token text, "createdAt" timestamp without time zone,"updatedAt" timestamp without time zone,CONSTRAINT tokenid PRIMARY KEY (id));'	
					client.query(sqlstat,function(err, result) {
						if (err) {
							return next({dbconf:"error",error:"can not create tables",errmsg:err});
						};
						insertdefaults();
					});
				
				}
				function logrcfg(){
					var conString = cstring + cfgdata;
					client = new pg.Client(conString);
					client.connect(createtables);
				}
				var sqlstat = "CREATE DATABASE "+cfgdata+" ENCODING = 'UTF8'";
				client.query(sqlstat,function(err, result) {
					if (err) {
						return next({dbconf:"error",error:"can not create " + cfgdata + " database",errmsg:err});
					};
					client.end()
					logrcfg();
				});
				//return next(false,{dbconf:"ok",cfg:cfgdata});
			};
			function cde (err,data){
				if (err){
					return next({dbconf:"error",error:cdata +" database not found!",errmsg:err});
				}
				if (data){
					cdstruct();
				}
			}
			var conString = cstring + cdata;
			client.end();
			client = new pg.Client(conString);
			client.connect(cde);
		};

		function checkerr(err){
			if (err.routine){
				if (err.routine == 'auth_failed'){
					//console.log("Invalid password or username");
					return next({dbconf:"error",error:"Invalid password or username",errmsg:err});
				};
				if (err.routine == 'InitPostgres'){
					//console.log("Invalid database name");
					createdata();
				};
			} else {
				if (err.errno == 'ECONNREFUSED'){
					//console.log("Invalid address");
					return next({dbconf:"error",error:"Invalid address",errmsg:err});
				};
			};
		};

		function cb(err,data){
			if(err){checkerr(err)};
			if (data){
				client.end();
				ckdb(data)}
		}

		var pg = require('pg');
		var conString = cstring+cfgdata;
		var client = new pg.Client(conString);
		client.connect(cb);
	}
}

 
