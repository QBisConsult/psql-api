/* RAPID configuration:
*
*  
**************************************/
var utl = require('./fgen.js');
var rpd = require('./db_struct.js');
var fs  = require('fs');
var ces = require('./cesmod.js');
process.env.co = "Q-bis Consult S.R.L./2015-09";

var copt = {
	country:"RO",
	state:"B",
	locality:"Bucharest",
	organization:"dev",
	organizationUnit:"team1",
	commonName:"localhost",
	emailAddress:"team1@dev.ro",
	days:20*365
};

module.exports = {
	rapidenv:function(){
		return JSON.parse(fs.readFileSync(process.env.mpath+'env.json').toString());
	},
	rapidcfg:function(){
		process.env.token_key = "";
		fs = require('fs');
		var cfg = JSON.parse(fs.readFileSync(process.env.mpath+'config.json').toString());
		utl.setk(cfg);
		return cfg;
	},
	checkssl:function(next){
		try {
		    var k = fs.readFileSync(process.env.mpath+'ssl/service.crt')
		    return next();
		}
		catch (e) { 
			//console.log(e);
			ces.newcertificate(copt,'service','ssl/',next)
		}
	},
	loadmdb:function(cfg,next){
		rpd.mdb(cfg,next);
	},
	checkstruct:function(){
		function checkpath(rpath){
			try{
				return fs.lstatSync(rpath);
			} catch (e){
				return false;
			}
		};
		
		if(!checkpath('ssl')){
			fs.mkdirSync('ssl');
		};
		if(!checkpath('ssl/bkp')){
			fs.mkdirSync('ssl/bkp');
		};
		if(!checkpath('logerr')){
			fs.mkdirSync('logerr');
		};
		if(!checkpath('js')){
			fs.mkdirSync('js');
		};
		if(!checkpath('js/jsedit-psql')){
			fs.mkdirSync('js/jsedit-psql');
			var apth = "";
			if (process.env.ismodule==true){apth = 'node_modules/kdman/'};
			fs.writeFileSync('js/jsedit-psql/rpdafter.js',fs.readFileSync(apth+'js/rpdafter.js'));
			fs.writeFileSync('js/jsedit-psql/rpdauth.js',fs.readFileSync(apth+'js/rpdauth.js'));
			fs.writeFileSync('js/jsedit-psql/rpdbefore.js',fs.readFileSync(apth+'js/rpdbefore.js'));
		};
		if(!checkpath('env.json')){
			var renv = {
			  development: true,
			  port: 3330,
			  start: true
			};
			fs.writeFileSync('env.json',JSON.stringify(renv,null,2))
		};
		if(!checkpath('ipallow.json')){fs.writeFileSync('ipallow.json',"[]")};
		if(!checkpath('config.json')){
			var rcfg = {
				  "userapid": true,
				  "host": "localhost",
				  "port": 5433,
				  "user": "postgres",
				  "password": "***",
				  "rapiddb": "rcfg",
				  "rapidid": "default",
				  "suser": "admin",
				  "spwd": "",
				  "isnew": true,
			};	
			fs.writeFileSync('config.json',JSON.stringify(rcfg,null,2))
		};
		
	}	
		
		
}
