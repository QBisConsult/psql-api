/* RAPID configuration:
*
*  
**************************************/
var utl = require('./fgen.js');
var rpd = require('./db_struct.js');
var fs  = require('fs');
process.env.co = "Q-bis Consult S.R.L./2015-09";

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
	loadmdb:function(cfg,next){
		rpd.mdb(cfg,next);
	}	
}
