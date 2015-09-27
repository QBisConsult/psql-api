var pg     = require('pg');
var fs     = require('fs');
var utl	   = require('./fgen.js');
var tutl   = require('./tutil.js');
var nfile = {};

function getfile(file){
	fs      = require('fs');
	var cstring   = fs.readFileSync(file).toString();
	return new Buffer(cstring).toString('base64');
}

var rifiles = [];

nfile = {};
	nfile.filename = 'rpdbefore';
	nfile.path = 'js';
	nfile.ftype = 'js';
	nfile.id = utl.hash(nfile.filename+'.'+nfile.ftype,26);
	nfile.createdAt = tutl.newUTCdate().utc;
	nfile.updatedAt = nfile.createdAt;
	nfile.updatedtime = tutl.newUTCdate().utctime;
	nfile.store = getfile(nfile.filename+'.'+nfile.ftype);
	rifiles.push(nfile);
nfile = {};
	nfile.filename = 'rpdafter';
	nfile.path = 'js';
	nfile.ftype = 'js';
	nfile.id = utl.hash(nfile.filename+'.'+nfile.ftype,26);
	nfile.createdAt = tutl.newUTCdate().utc;
	nfile.updatedAt = nfile.createdAt;
	nfile.updatedtime = tutl.newUTCdate().utctime;
	nfile.store = getfile(nfile.filename+'.'+nfile.ftype);
	rifiles.push(nfile);
	
var pgcfg = {
	host:"localhost",
	port:5433,
	user:"postgres",
	password:"1234",
	rapiddb:"rcfg"
}



function cb(err,data){
	if (err){client.end();return console.log("can not connect the database server")};
	rifiles.forEach(function(file){	
		var values = [];
		values.push(file.id);
		values.push(file.path);
		values.push(file.filename);
		values.push(file.ftype);
		values.push(file.createdAt);
		values.push(file.updatedAt);
		values.push(file.updatedtime);
		values.push(file.store);		
		sqlstat ='insert into files (id,path,filename,ftype,"createdAt", "updatedAt",updatedtime,store)';
				sqlstat = sqlstat + " values ($1,$2,$3,$4,$5,$6,$7,$8)";
		client.query(sqlstat,values,function(err, result){
			if (err) {
				console.log({message:"error",error:"can not load information",errmsg:err});
			};
			console.log(result);
		});
	}); client.end();
};


var cstring = "postgres://"+pgcfg.user+":"+pgcfg.password+"@"+pgcfg.host+":"+pgcfg.port+"/"+pgcfg.rapiddb
var client = new pg.Client(cstring);
client.connect(cb);





//new Buffer(res, 'base64').toString('utf8')


