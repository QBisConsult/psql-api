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
		return JSON.parse(fs.readFileSync('env.json').toString());
	},
	rapidcfg:function(){
		process.env.token_key = "";
		fs = require('fs');
		var cfg = JSON.parse(fs.readFileSync('config.json').toString());
		utl.setk(cfg);
		return cfg;
	},
	checkssl:function(next){
		try {
		    var k = fs.readFileSync('./ssl/service.crt')
		    return next();
		}
		catch (e) { 
			//console.log(e);
			ces.newcertificate(copt,'service','./ssl/',next)
		}
	},
	loadmdb:function(cfg,next){
		rpd.mdb(cfg,next);
	}	
}
