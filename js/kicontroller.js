/**
 * RAPID CRUD controller
 *
 * @description :: 
 * @help        :: 
 */

var dbs   = require('./dbcon.js');
var utils = require('./fgen.js')
var rdb   = require('./rapidpg.js')
var pg    = require('pg');
var fs    = require('fs');
var cto   = require('./pgt.js');
var intc  = require('./intcommands.js');
var ipr	  = require('./ipallow.js');

module.exports = {
   /**
   * CommentController.create()
   */
	command: function (req,res,cfg) {
		if(!ipr.checkip(req,process.rapidcfg.ipallow)){return res.status(401).send({message:"error",error:"access allowed by IP"})}
		var ck = utils.checkadmpwd(req,process.rapidcfg.suser,process.rapidcfg.spwd);
		if (ck.message != "OK"){return res.send({error:ck.error})};
		if (!process.rapidcfg.mdb && req.params["0"] !== 'reload'){
			return res.status(404).send({error:"system not configured"})
		};
		/*console.log(req.params["0"]);
		console.log(req.body);
		console.log(req.query);
		console.log(req.method); */
		var fastr = req.params["0"];	
		if (typeof intc[fastr]=='function'){intc[fastr](req,res,cfg)} else {
			res.status(404).send({error:"service not implemented",service:fastr})}
	},
	login: function (req,res) {
		if(!ipr.checkip(req,process.rapidcfg.ipallow)){return res.status(401).send({message:"error",error:"access allowed by IP"})}
		res.send(utils.checkadmpwd(req,process.rapidcfg.suser,process.rapidcfg.spwd));
	},
	info: function (req,res){
		if(!ipr.checkip(req,process.rapidcfg.ipallow)){return res.status(401).send({message:"error",error:"access allowed by IP"})}
		var action = 1;
		if (process.rapidcfg.suser == 'noset'){action=0}
		res.send({id:process.rapidcfg.rapidid,isnew:process.rapidcfg.isnew,action:action});
	},
	pset: function (req,res){
		if(!ipr.checkip(req,process.rapidcfg.ipallow)){return res.status(401).send({message:"error",error:"access allowed by IP"})}
		var newcfg 	= {"userapid":true,"host":"nohost","port":5433,"user":"nouser","password":"nopass","rapiddb":"rcfg",
		"rapidid":"default","suser":"noset","spwd":"noset","isnew":true};
		//console.log(req.body);
		//console.log(req.headers.authorization);
		if(!req.headers.authorization){
			if(!process.rapidcfg.isnew){return res.status(404).send({error:"system credits can not be changed"})};
		} else	{
			var ck = utils.checkadmpwd(req,process.rapidcfg.suser,process.rapidcfg.spwd);
			if (ck.message != "OK"){return res.send({error:ck.error,auth:"failed"})};
			
			newcfg.host 	= process.rapidcfg.host;
			newcfg.user 	= process.rapidcfg.user;
			newcfg.password = process.rapidcfg.password;
			newcfg.isnew	= process.rapidcfg.isnew;
		}	
		
		if(!req.body.usr){return res.status(404).send({error:"usr is required"})};
		if(!req.body.pwd){return res.status(404).send({error:"pwd is required"})};
		
		newcfg.suser 	= req.body.usr.toLowerCase();
		newcfg.spwd 	= req.body.pwd;
		if (process.rapidcfg.etk){newcfg.etk = process.rapidcfg.etk}
		fs.writeFileSync(process.env.mpath+'config.json', JSON.stringify(newcfg,null,2));
		process.rapidcfg.suser = req.body.usr.toLowerCase();;
		process.rapidcfg.spwd  = req.body.pwd;
		return res.send({id:process.rapidcfg.rapidid,isnew:process.rapidcfg.isnew,action:action=1});
	},
	setup: function (req,res,cfg){
		if(!ipr.checkip(req,process.rapidcfg.ipallow)){return res.status(401).send({message:"error",error:"access allowed by IP"})}
		function cb(err,data){
			client.end();
			delete client;
			if (err){
				var errmsg = ""
				console.log(err);
				if (err.routine){
					if (err.routine == 'auth_failed'){
						errmsg ="Invalid password or username";
					};
					if (err.routine == 'InitPostgres'){
						errmsg ="Invalid database name";
					};
				//return res.send({error:"connection error"})
				} else {
					if (err.errno == 'ECONNREFUSED'){
						errmsg ="Invalid domain address or port";
					};
					if (err.errno == 'ENOTFOUND'){
						errmsg ="Invalid domain address or port";
					};
				}
				
				return res.send({error:"connection error",errmsg:errmsg})
			};
			var rsp = req.body;
			rsp.result = "OK"
			return res.send(rsp);
		};
		var ck = utils.checkadmpwd(req,process.rapidcfg.suser,process.rapidcfg.spwd);
		if (ck.message != "OK"){return res.send({error:ck.error})}
		console.log(req.body);
		if (!req.body){return res.send({error:"Body required"})};
		if (!req.body.domain){return res.send({error:"domain required"})};
		if (!req.body.port){return res.send({error:"port required"})};
		if (!req.body.db){return res.send({error:"db required"})};
		if (!req.body.usern){return res.send({error:"usern required"})};
		if (!req.body.pwd){return res.send({error:"pwd required"})};
		var cstring = "postgres://"+req.body.usern+":"+req.body.pwd+"@"+req.body.domain+":"+req.body.port+"/"+req.body.db
		console.log(cstring);
		if (!req.body.action){
			var client = new pg.Client(cstring);
			client.connect(cb);
		} else {
			function done(){return res.send({result:"OK",request:req.body})};
			
			var newcfg = {	
				userapid: true,
				host: req.body.domain,
				port: req.body.port,
				user: req.body.usern,
				password: req.body.pwd,
				rapiddb: "rcfg",
				rapidid: "default",
				suser:process.rapidcfg.suser,
				spwd:process.rapidcfg.spwd,
				isnew:false,
				aip:process.rapidcfg.aip,
				env:process.rapidcfg.env
			};
			if (process.rapidcfg.etk){newcfg.etk = process.rapidcfg.etk}
			fs.writeFileSync(process.env.mpath+'config.json', JSON.stringify(newcfg,null,2));
			process.rapidcfg = newcfg;
			//console.log(cfg);
			if (req.body.action == 1){cfg.loadmdb(process.rapidcfg,done)};
			if (req.body.action == 2){
				var cdata 	= req.body.db;
				var cfgdata 	= "rcfg";
				var copt = {
					user:newcfg.user,
					password:newcfg.password,
					address:newcfg.host,
					port:newcfg.port
				}
				function rcfgfin (err,data){
					console.log(err);
					console.log(data);
					if (err){return res.send({result:"error",error:err})};
					if (data){
						cfg.loadmdb(process.rapidcfg,done);
					};
				};
				cto.init(copt,cdata,cfgdata,rcfgfin);
			};
		};
	}	
};
