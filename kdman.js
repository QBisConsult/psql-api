// requires
var fs	  	= require('fs');
var app   	= require('express')();
var r		= require('express')();
var utils 	= require('./js/fgen.js');
var rapid   	= require('./js/rapidcontroller');
var kint	= require('./js/kicontroller');
var cfg   	= require('./js/config.js');
//var ct 		= require('./js/tokenAuth');
var ct 		= require('./js/rpdauth.js');
var cors 	= require('cors');
var ipr		= require('./js/ipallow.js');
var bodyParser  = require('body-parser')	
//require('use-strict')

//

var admin_port	= 443;
var webroot 	= './webroot';

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors()); // Enable CORS

r.use(bodyParser.urlencoded({ extended: false }))
r.use(bodyParser.json())
r.use(cors()); // Enable CORS

console.reset = function (){return process.stdout.write('\033c')};console.reset();
function mbr(rp){var nsl = rp.search("/");if(nsl==-1){return rp}else{return rp.slice(0,nsl)}};
console.reset();

// Routes:

// Server configuration application
app.get('/login',function(req,res){kint.login(req,res)});
app.post('/setup',function(req,res){kint.setup(req,res,cfg)});
app.get('/info',function(req,res){kint.info(req,res)});
app.post('/pset',function(req,res){kint.pset(req,res,cfg)});		
app.all('/int/*',function(req,res){kint.command(req,res,cfg)});
// Static pages:
app.get('/', function(req, res){
	if(!ipr.checkip(req,process.rapidcfg.ipallow)){return res.status(401).send({message:"error",error:"access allowed by IP"})}
	var ss = fs.createReadStream(webroot+"/index.html");ss.pipe(res);
	ss.on("error",function(err){res.status(404).send("File not found")})
	});
app.get('/*',function(req, res){
	if(!ipr.checkip(req,process.rapidcfg.ipallow)){return res.status(401).send({message:"error",error:"access allowed by IP"})}
	var ss = fs.createReadStream(webroot+req.url);ss.pipe(res);
	ss.on("error",function(err){res.status(404).send("File not found")})
	});
// RAPID - database CRUD operations	
r.all('/rapid/*',function(req,res){
	if (!process.rapidcfg.mdb){return res.send({error:"system not configured"})}
	function action(ce){rapid.command(req,res)};ct(req,res,action)});

// SETUP
process.rapidcfg 	 = cfg.rapidcfg();
process.rapidcfg.env 	 = cfg.rapidenv();
process.rapidcfg.ipallow = JSON.parse(fs.readFileSync('ipallow.json').toString())
//console.log(process.rapidcfg.rpdp);

cfg.loadmdb(process.rapidcfg,start) // START

function start(){
	var sslOptions 	= {
	  key: fs.readFileSync('./ssl/service.key'),
	  cert: fs.readFileSync('./ssl/service.crt'),
	  rejectUnauthorized: false
	};
	var https  	= require('https').Server(sslOptions,app);
	if (process.rapidcfg.env.devssl || !process.rapidcfg.env.development){
		var rsrv	= require('https').Server(sslOptions,r)} else {
		var rsrv	= require('http').Server(r)}

	https.listen(admin_port, function(){
	  console.log();
	  console.log();
	  console.info('\033[0m------------------------------------------------------');
	  console.info('-       PostgreSQL RAPID API server:   ');
	  console.info('------------------------------------------------------');
	  console.info('-       Admin on :',admin_port);
	  console.info('-       HTTPS protocol         ');
	  console.info('------------------------------------------------------'); 
	  if (!process.rapidcfg.env.start){
		console.info('-       RAPID API SERVER - NOT started'); 
		console.info('------------------------------------------------------');
	  }
	})
	if (process.rapidcfg.env.start){
		rsrv.listen(process.rapidcfg.env.port,function(){
		  console.info('-       RAPID on :',process.rapidcfg.env.port);
		  if (process.rapidcfg.env.devssl || !process.rapidcfg.env.development){
		  console.info('-       HTTPS protocol/ Production:',!process.rapidcfg.env.development)} else {
		  console.info('-       HTTP  protocol/ Production:',!process.rapidcfg.env.development)}
		  if (!process.rapidcfg.env.devssl && process.rapidcfg.env.development){
		  console.info('-\033[31m       RAPID SERVER data transfer \033[0m is NOT protected!        '); 
		  }
		  console.info('------------------------------------------------------');
		})
	}
};