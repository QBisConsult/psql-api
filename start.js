var exec = require('child_process').exec;
var fs = require('fs');
var child = "";
function error(data){
	console.log(data);
	var d = new Date();
	var daylog = "logerr/log"+d.getUTCFullYear()+"_"+(d.getUTCMonth()+1)+"_"+d.getUTCDate()+".txt";
	fs.appendFileSync(daylog, "\r\n ERROR:" + d + "\r\n"+ data);
	if (data.substring(0, 14)=='_tls_common.js'){
		console.log("SSL error");
		fs.createReadStream('ssl/bkp/service.crt').pipe(fs.createWriteStream('ssl/service.crt'));
		fs.createReadStream('ssl/bkp/service.key').pipe(fs.createWriteStream('ssl/service.key'));
	};
};

function reset(){
	start();
};
function start(){
	child = exec('node kdman.js');
	child.stdout.on('data', function(data) {
	    console.log(data);
	});
	child.stderr.on('data', function(data) {
	    error(data);
	});
	child.on('close', function(code) {
	    if (code>0){reset()} else {console.log('closing code: ',code)};
	});
};
start();


