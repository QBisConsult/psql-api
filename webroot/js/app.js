var app = angular.module('PGREST', ['ui.bootstrap','ui.ace','ngTable']);

app
  .controller('SettingsCtrl',['$rootScope','$scope','$http','$location','$timeout', function ($rootScope,$scope,$http,$location,$timeout) {
  	// $scope.rl = true;
    	$scope.ttest = "test";
    	$scope.reset = 0;
    	$scope.errmsg = "";
    	$scope.step = 0;
    	$scope.stepcaption = "RDS PostgreSQL Database access credits"
    	$scope.prevsc = $scope.stepcaption;
    	$scope.subcaption = ""
    	$scope.jwt = {pwd:"",rpwd:"",err:""}
    	$scope.ssl = {crt:"",key:"",certificate:{},err:"",msg:""};
    	//$scope.port = 5432;
    	//console.log('Settings');
    	$scope.chmode = false;
    	$scope.mode = {port:0,production:false,ssl:false}
    	$scope.con = {domain:"",port:5433,db:"",usern:"",pwd:""}
	$scope.rmsg = "";
	$scope.allowip = "[]";
	$scope.reportedIp = "127.0.0.1";
	$scope.ipfilter = function(){
		var c = '["i","c","d"r]';
		var f = [];
		try {
		   f = JSON.parse(c);
		} catch (e) {}
		
		//console.log(f);
	};
	
	$scope.aceLoaded4 = function(_editor) {
	    _editor.setReadOnly(false);
	    _editor.setFontSize(16);
	    _editor.$blockScrolling = Infinity;
	    _editor.setOptions({
		    enableBasicAutocompletion: true
		});
	    $scope.acedit = _editor;
	  };
    	$scope.reconfig = function(){
    		$scope.step = 0;
    		$rootScope.isnew = true;
    		$scope.stepcaption = "RDS PostgreSQL Database access credits"
    	};
    	$scope.stepback = function(step){
    		$scope.stepcaption = $scope.prevsc;
    		$scope.step = step;
    	};
  	
    	$scope.reload = function(){
    		//console.log('reload');
    		$scope.errmsg="";
    		var req = {
		      method: 'GET',
		      url: $rootScope.baseurl+'int/reload'};
    		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
			  	//console.log(response);
				if (response.data.error){
					$scope.step=1;
					$scope.errmsg=response.data.error;
					if (response.data.copt){$scope.con = response.data.copt};
				};
				if (response.data.mdb){
					$rootScope.mdb   = response.data.mdb;
					$rootScope.sysok = true;
					//console.log(
				};		
			};
		};

		gms($http,req,localStorage.ast,getdata);
    	};
    	
    	$scope.done = function(){
    		//console.log('done');
    		$scope.$emit('loadmdb', '!isnew');
    	};

	$scope.savecfg = function(twh){
		//console.log("savecfg",twh);
    		//console.log($scope.con);
    		$scope.con.action = twh;
    		$scope.errmsg = "";
    		var req = {
		      method: 'POST',
		      url: $rootScope.baseurl+'setup',
		      data:$scope.con}
		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
		  		//console.log(response);
				$scope.prevsc = $scope.stepcaption;
				$scope.stepcaption = "Configuration complete"
				$rootScope.rl = false;
				$rootScope.sysok = true;
				if (response.data.error){$scope.step=5}
				if (!response.data.error){$scope.step=6};	//;console.log("saved")	
			};
		};

		gms($http,req,localStorage.ast,getdata);
	};

	$scope.checkrcfg = function(){
		//console.log("checkrcfg");
    		//console.log($scope.con);
    		var defdb = $scope.con.db;
    		$scope.con.db = "rcfg";
    		delete $scope.con.action;
    		var req = {
		      method: 'POST',
		      url: $rootScope.baseurl+'setup',
		      data:$scope.con}
		function getdata(err,response){
			if(err){$scope.con.db = defdb;$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
				$scope.con.db = defdb;
				$scope.prevsc = $scope.stepcaption;
				$scope.stepcaption = "Configuration"
				if (response.data.error){$scope.step=2}
				if (!response.data.error){$scope.step=4};		
			};
		};
		gms($http,req,localStorage.ast,getdata);
	};
    	$scope.working = false;
    	$scope.dbcheck = function(con){
    		$scope.working = true;
    		$scope.errmsg = "";
	    	var req = {
			      method: 'POST',
			      url: $rootScope.baseurl+'setup',
			      data:con,
			      timeout:3000}
    		function getdata(err,response){
    			$scope.working = false;
			if(err){$scope.errmsg = "Please check the database server domain name and port!.";console.log({error:err})};
			if(response){
			  	//console.log(response);
				$scope.prevsc = $scope.stepcaption;
				$scope.stepcaption = "Check database access rights"
				$scope.subcaption = ""
				if (response.data.error){$scope.errmsg = response.data.error + '/ ' +response.data.errmsg}
				if (!response.data.error){$scope.step=1;};		
			};
		};

		gms($http,req,localStorage.ast,getdata);
    	};
    	
    	$scope.joker= function(){	
    		$scope.$emit('loadmdb', 'reload');
    	};
    	$scope.cancelreset = function(){
    		$scope.reset = 0;
    		$scope.$emit('loadmdb', '!isnew');
    	};
    	$scope.changedb = function(){
    		$scope.con.domain=$rootScope.mdb.host;
    		$scope.con.port  = $rootScope.mdb.port;
    		$scope.con.port  = $rootScope.mdb.port;
    		$scope.con.db    = $rootScope.mdb.databases.names[0];
    		$scope.con.usern = $rootScope.mdb.dbuser;
    		$scope.step = 0;
    		$scope.reset = 1;
    		$scope.$emit('loadmdb', 'isnew');
    	};
    	$scope.savetpwd = function(){
    		$scope.jwt.err = "";
    		if ($scope.jwt.pwd != $scope.jwt.rpwd){return $scope.jwt.err = "Please check. Passwords don't match!"}
    		if ($scope.jwt.pwd.length < 16){return $scope.jwt.err = "Please check. Password should be at least 16 characters long."}
    		var req = {
			      method: 'POST',
			      url: $rootScope.baseurl+'int/savetpwd',
			      data:{tk:$scope.jwt.pwd}}
    		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
			  	//console.log(response);
				$scope.canceltpwd()		
			};
		};
		gms($http,req,localStorage.ast,getdata);
    	};
    	$scope.checknewsslcon = function(){
    		$scope.ssl.msg =""
    		function getdata(err,response){
			if(err){$scope.ssl.err = "Please press F5 and reload.";console.log({error:err})};
			if(response){
    				$scope.ssl.msg = "Certificate saved OK. Testing connection ...OK"
    				$scope.canceltpwd()		
			};
		};
    		var req = {
			      method: 'GET',
			      url: $rootScope.baseurl+'int/getsslinfo',
			      }
		gms($http,req,localStorage.ast,getdata); 
    	};
    	$scope.savemode = function(){
    		$scope.mode.err = "";
    		var req = {
			      method: 'POST',
			      url: $rootScope.baseurl+'int/savemode',
			      data:{p0:$scope.mode.start,p1:$scope.mode.port,p2:$scope.mode.production,p3:$scope.mode.ssl}}
    		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
			  	$rootScope.rapicfg.devssl = $scope.mode.ssl;
			  	$rootScope.rapicfg.development = !$scope.mode.production;
			  	$rootScope.rapicfg.port = $scope.mode.port;
			  	$rootScope.rapicfg.protocol = "HTTPS";
			  	$rootScope.rapicfg.start = $scope.mode.start;
					if ($rootScope.rapicfg.development){
						$rootScope.rapicfg.mode = "DEVELOPMENT";
						if (!$rootScope.rapicfg.devssl){ 
							$rootScope.rapicfg.protocol = "HTTP (Not secured)";
						}
					} else {$rootScope.rapicfg.mode = "PRODUCTION"}
				$scope.canceltpwd()
			};
		};
		gms($http,req,localStorage.ast,getdata);
    		
    	};
    	$scope.reset = function(){
    		var req = {
			      method: 'GET',
			      url: $rootScope.baseurl+'int/reset'}
    		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
				$scope.rmsg = "Server restart - OK"
			};
		};
		gms($http,req,localStorage.ast,getdata);
    	};
    	$scope.savesslc = function(){
    		$scope.ssl.err = "";
    		if ($scope.ssl.crt.length<100){return $scope.ssl.err = "Please check certificate!"}
    		if ($scope.ssl.key.length<100){return $scope.ssl.err = "Please check key!"}
    		var req = {
			      method: 'POST',
			      url: $rootScope.baseurl+'int/savessl',
			      data:{c:$scope.ssl.crt,k:$scope.ssl.key}}
    		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
			  	//console.log(response);
			  	$scope.ssl.msg = "Certificate saved OK. Testing connection ..."
			  	$timeout($scope.checknewsslcon(), 5500);
				//$scope.canceltpwd()		
			};
		};
		gms($http,req,localStorage.ast,getdata);
    		
    	};
    	$scope.changemode = function(){
    		$scope.rmsg = "";
    		//console.log($rootScope.rapicfg);
    		$scope.mode.port 	= $rootScope.rapicfg.port;
    		$scope.mode.production  = !$rootScope.rapicfg.development;
    		$scope.mode.ssl		= $rootScope.rapicfg.devssl;
    		$scope.mode.start	= $rootScope.rapicfg.start;
    		$scope.stepcaption= "RAPID API server configuration";
    		$scope.step=12;
    		$rootScope.isnew = true;
    		$scope.chmode = true;
    	};
    	$scope.changessl = function(){
    		$scope.rmsg = "";
    		$scope.ssl.err = "";
    		$scope.stepcaption= "SSL certificate";
    		$scope.step=10;
    		$rootScope.isnew = true;
    		$scope.chmode = true;
    	};
    	$scope.saveiplist = function(ce){
    		//$scope.errmsg = "";
    		$scope.ipflterr = "";
    		var f = [];
    		try {
		   f = JSON.parse($scope.allowip);
		} catch (e) {f = false}
		if (!f){return $scope.ipflterr = "Errors in IP allow list array"}
    		if (ce == 1 && f.length >0 && f.indexOf($scope.reportedIp) == -1){$scope.ipflterr = "ERROR: your reported IP ("+
    		$scope.reportedIp+") is NOT in allow list array"}
    		function getdata(err,response){
			if(err){$scope.ipflterr = "Server error, please try again.";console.log({error:err})};
			if(response){
				$scope.canceltpwd();		
			};
		};
    		var req = {
			      method: 'POST',
			      url: $rootScope.baseurl+'int/saveiplist',
			      data:{aip:$scope.allowip}
			      }
		gms($http,req,localStorage.ast,getdata);
    	
    	};
    	$scope.changeIp = function(){$scope.ipflterr = ""};
    	$scope.ipfilter = function(){
    		$scope.rmsg = "";
    		//
    		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
				//$scope.iperr.err = "";
				$scope.ipflterr = "";
		    		$scope.stepcaption= "IP filter - allow list";
		    		$scope.step=13;
		    		$rootScope.isnew = true;
		    		$scope.chmode = true;
		    		$scope.reportedIp = response.data.ip;
		    		$scope.allowip = angular.toJson(response.data.aip,true)		
			};
		};
    		var req = {
			      method: 'GET',
			      url: $rootScope.baseurl+'int/ipallowlist',
			      }
		gms($http,req,localStorage.ast,getdata);
    	};
    	$scope.changetpwd = function(){
    		$scope.rmsg = "";
    		$scope.stepcaption= "Authorization token password";
    		$scope.step=9;
    		$rootScope.isnew = true;
    		$scope.chmode = true;
    	};
    	$scope.viewssl = function(){
    		$scope.rmsg = "";
    		function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
			if(response){
				$scope.ssl.certificate = response.data.certificate;
				console.log(response.data);
				$scope.stepcaption= "SSL certificate preview";
			  	$scope.step=11;
    				$rootScope.isnew = true;
    				$scope.chmode = true;
    						
			};
		};
    		var req = {
			      method: 'GET',
			      url: $rootScope.baseurl+'int/getsslinfo',
			      }
		gms($http,req,localStorage.ast,getdata);   
    	};
    	$scope.cancelsslc = function(){
    		$scope.chmode = false;
    		$scope.step= 0;
    		$rootScope.isnew = false;
    		$scope.stepcaption="RDS PostgreSQL Database access credits";
    	};
    	$scope.canceltpwd = function(){
    		$scope.chmode = false;
    		$scope.step= 0;
    		$rootScope.isnew = false;
    		$scope.stepcaption="RDS PostgreSQL Database access credits";
    	};
    	$scope.$on('closetab', function(event, mass) { 
    		console.log("ct",mass);
    		if($scope.chmode){$scope.canceltpwd()}
    	});
    	$scope.changepwd = function(){
    		//console.log('changepwd fired');
    		$scope.$emit('changepwd', 'pwd');
    	}
    	if (!$rootScope.isnew){
    		if ($rootScope.sysok){
    			//alert('normal settings page');
    		} else {
    			//alert('invalid settings page');
    			$scope.step=0;
    			$scope.stepcaption="Invalid settings";
    		}
    	}
  }])
  // Declare the AppCtrl controller
  .controller('AppCtrl', ['$rootScope','$scope','$http','$location', function ($rootScope,$scope,$http,$location) {
    $rootScope.mdb = {};
    $rootScope.rapicfg = {};
    $rootScope.baseurl = "https://" + $location.host() + ":443/";
    $rootScope.rfls = {};
    $rootScope.rl = false;
    $rootScope.sysok = false;
    $rootScope.currenttab = 0;
    //$scope.sysok = true;
    $rootScope.isnew = false;
    $scope.errmsg = "";
    $scope.gosetmessage = "";
    $scope.rl = $rootScope.rl;
    $scope.username = localStorage.username;
    $scope.pwd = "";
    $scope.ls = 1;
    $scope.joker=""
    $scope.configuration = {};
    $scope.newinstall = "New server installation";
    var counter = {};
    	counter.cnt = 0;
    	counter.sql = 0;
    	counter.nav = 0;
    	counter.qr = 0;
    	counter.dt = 0;
    	counter.rl = 0;
    	counter.tkn = 0;
    $scope.tabs = [];
    $scope.tname = function(tname,opt){
    	//console.log(tname,opt);
    	var ctr = 0
	if (tname == "Data"){counter.dt++;ctr    = counter.dt};
	if (tname == "Queries"){counter.qr++;ctr = counter.qr};
	if (tname == "Rules"){counter.rl++;ctr = counter.rl};
	if (tname == "Tokens"){counter.tkn++;ctr = counter.tkn};
    	$scope.tabs[$rootScope.currenttab].title = tname+" "+ctr;
    }
    $scope.addTab = function (sr,ce,tname,cie) {
        if (!$rootScope.rl || tname == 'About'){
	    	var content = '/pages/'+ce +'.html'
	    	var title = tname
	    	var texist = false
	    	if (cie){
			$scope.tabs.forEach(function(etab){
				//console.log(etab.content);
				if (etab.content == content){
					etab.active = true;
					texist = true;
				};
			});
		}
		if (!texist){
			if (ce == "newsql"){counter.sql++;title=title+' '+counter.sql};
			if (ce == "newnav"){counter.nav++;title=title+' '+counter.nav};
			var newtab = {title: title, content: content,showremove:sr,pagename:ce};
			$scope.tabs.push(newtab);
			counter.cnt++;
			$rootScope.currenttab = $scope.tabs.length-1; 
			$scope.tabs[$scope.tabs.length - 1].active = true;
		};
	};
    };
    $scope.removeTab = function (event, index) {
      event.preventDefault();
      event.stopPropagation();
      $scope.$broadcast("closetab",$scope.tabs[index].title);
      $scope.tabs.splice(index, 1);
      
    };
    $scope.tabClick = function(event, index){
    	$scope.rl = $rootScope.rl
    	$scope.sysok = $rootScope.sysok
    	event.preventDefault();
      	event.stopPropagation();
      	$scope.tabs[index].active = true;
    };
    function adaptmdb(){
    		$rootScope.mdb.dbtables = {};
		$rootScope.mdb.tables.names.forEach(function(table){
			var idb = $rootScope.mdb.tables.db[table]
			if (!$rootScope.mdb.dbtables[idb]){$rootScope.mdb.dbtables[idb]=[]};
			//console.log('adt0',table);
			var tbl = {tablename:table};
			var fields = [];
			var flds = Object.keys($rootScope.mdb.tables.structures[table]);
			flds.sort();
			flds.forEach(function(field){
				var fld = {fname:field}
				fld.detail = $rootScope.mdb.tables.structures[table][field]
				fields.push(fld);
				
			});
			//console.log('adt1');
			tbl.fields = fields;
			$rootScope.mdb.dbtables[idb].push(tbl);
			var queries = [];
			var sqls = Object.keys($rootScope.mdb.sqls);
			//console.log('adt2');
			sqls.forEach(function(q){
				var qry = $rootScope.mdb.sqls[q];
				queries.push({id:qry.id,queryname:q,inuse:qry.inuse,dbs:qry.database})});
			sqls = Object.keys($rootScope.mdb.esqls);
			sqls.forEach(function(q){
				var qry = $rootScope.mdb.esqls[q];
				queries.push({id:qry.id,queryname:q,inuse:qry.inuse,dbs:qry.database})});
			$rootScope.mdb.queries = queries;
		});
		//console.log($rootScope.mdb);
    };    
    $scope.loadmdb = function(){
    	    var req = {
		      method: 'GET',
		      url: $rootScope.baseurl+'int/getmdb'}
	    function getdata(err,response){
			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})}
			if(response){
		  		//console.log("LI:",response);
				if (response.data.mdb){
					$rootScope.mdb   = response.data.mdb;
					adaptmdb();
					$scope.configuration = response.data.mdb;
					//$scope.joker = response.data.mdb.databases.number
					$scope.configuration.username = $scope.username;
					response.data.env.protocol = "HTTPS";
					if (response.data.env.development){
						response.data.env.mode = "DEVELOPMENT";
						if (!response.data.env.devssl){ 
							response.data.env.protocol = "HTTP (Not secured)";
						}
					} else {response.data.env.mode = "PRODUCTION"}
					$rootScope.rapicfg = response.data.env;
					//console.log($scope.configuration); 	
				};
			};
	    };
	    
	    gms($http,req,localStorage.ast,getdata);
    };

    $scope.reloadmdb = function(){    
    	var req = {
		      method: 'GET',
		      url: $rootScope.baseurl+'int/reload'}			 
    	function getdata(err,response){
		if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})};
		if(response){
	  		if (response.data.mdb){
				$rootScope.mdb   = response.data.mdb;
				adaptmdb();
				$scope.configuration = response.data.mdb;
				$scope.configuration.username = $scope.username;
			};
		};
	};

	gms($http,req,localStorage.ast,getdata);
    };
    
    $scope.tlogin = function(u,p,ast){
    	if (!ast){
	    	localStorage.username = u;
		var p = getAuth(u+':'+p);
		localStorage.ast = p} else {p = ast};
	var req = {
	      method: 'GET',
	      url: $rootScope.baseurl+'login'};
	 function getdata(err,response){
		if(err){$scope.errmsg = "Server error, please try again later or contact an administrator";console.log({error:err})};
		if(response){
		  	if (response.data.message == "OK"){
				$scope.rl = false;
				$rootScope.rl = false;
				$rootScope.sysok = response.data.sysok;
				if (response.data.sysok){
					$scope.loadmdb();
					$scope.errmsg = "loading info";
				}
				//$scope.sysok = response.data.sysok;
				if (response.data.isnew){
					$rootScope.isnew = true;
					$scope.gosetmessage = "This is a fresh installation of the REST API server.";
				} else {
					$scope.gosetmessage = "The REST API server requires more settings."
				};
			} else {$scope.errmsg = response.data.error};		
		};
	};

	gms($http,req,p,getdata);     
    };
    
    $scope.$on('reloadmdb', function (event, data) {
  		//console.log(data,'mdb'); // 'Data to send'
  		if (data=='reload'){$scope.reloadmdb()};
	});
    $scope.$on('loadmdb', function (event, data) {
  		//console.log(data,'mdb'); // 'Data to send'
  		if (data=='reload'){$scope.loadmdb()};
  		if (data=='isnew'){
  			$scope.isnew=true;
  		};
  		if (data=='!isnew'){
  			$scope.isnew=false;
  			$scope.loadmdb();
  		};
    });
    
   /* $scope.changepwd = function(){
    	$scope.firstload=0;
    	$scope.ls=2;
    	$scope.newinstall = "Change password";
    	$scope.errmsg = "";
    	$scope.addTab(false,'start','Start',true);
    };*/
    
    $scope.$on('changepwd',function(event,data){
    	//console.log(data);
    	$scope.firstload=0;
    	$scope.ls=2;
    	$scope.newinstall = "Change password";
    	$scope.errmsg = "";
    	$scope.addTab(false,'start','Start',true);
    });
    
    $scope.next = function(){
    	//console.log($scope.ls);
    	$scope.ls=$scope.ls+1;
    	if($scope.ls>3){$scope.firstload=1}
    };

    $scope.setfirstpass = function(tu,tp,rtp){
        if (tp!=rtp){return $scope.errmsg = "Password do not match!"}
    	$scope.errmsg = "";
    	$scope.cms = "";
    	$scope.ls = 3;
    	var auth = false;
    	if (!$scope.isnew){auth = localStorage.ast};
	function getdata(err,response){
		if(err){$scope.errmsg = "Server error, please try again later or contact an administrator";console.log({error:err})};
		if(response){
			//console.log("OK 4")
			$scope.ls=3;
			$scope.username = tu;
			localStorage.username = tu;
			localStorage.ast = "";
		};
	};
	var req = {
	      method: 'POST',
	      url: $rootScope.baseurl+'pset',
	      data:{usr:tu,pwd:tp}}
		
	gms($http,req,auth,getdata);
    };
    $scope.settings = function(){
    	$scope.addTab(true,'settings','Settings',true);
    };
    $scope.ra = function(index){
    	$rootScope.currenttab = index;
    };
    
    $scope.addTab(false,'start','Start');
    $scope.rl = true;
    $rootScope.rl = true;
    //$scope.ls = 1;
    $scope.logoff = function(){
    	$scope.pwd = "";
    	localStorage.ast = "";
    	$scope.rl = true;
    	$rootScope.rl = true;
    	$scope.errmsg = "";
    	var ntab = [$scope.tabs[0]];
    	$scope.tabs = ntab;
    }
    $scope.loadinfo= function(){
    	console.log("loading info");
    	function getdata(err,response){
    		if(err){$scope.errmsg = "Server error, please try again later or contact an administrator";console.log({error: err})};
    		if(response){	
    			//console.log("OK");
    			$scope.firstload = response.data.action;
			if (response.data.action = 0){
				$scope.tu  = "";
				$scope.tp  = "";
				$scope.rtp = "";
				$scope.cms = "";
			};
			//console.log(response);
			if (response.data.isnew){
				localStorage.username ="";
				localStorage.ast = "";
				return $scope.firstload = 0}
			if (localStorage.ast){ return $scope.tlogin('1','2',localStorage.ast)};
		};
    	};
    	var req = {
	      method: 'GET',
	      url: $rootScope.baseurl+'info'
	      }
    	gms($http,req,false,getdata);
    };
    
    $scope.loadinfo();
    
    
  }])
  .controller('TokensCtrl',['$rootScope','$scope','$http','$location','NgTableParams', function ($rootScope,$scope,$http,$location,NgTableParams){
     $scope.tkid = "new"
     $scope.tkname = ""
     $scope.token   = "{}"
     $scope.jwt  = "Bearer ..."
	    
     $scope.data = [];
     $scope.tableParams = new NgTableParams({ count: 5}, { counts: [5, 10, 25], dataset: $scope.data});
     $scope.add = function(){
        data.push({name:"Gigi",age:45});
     };
     $scope.edit = function(item){
  	$scope.tkid   = item.id;
  	$scope.tkname = item.tname;
  	$scope.token  = item.token;
  	$scope.jwt    = item.jwt;
     };
     $scope.newtk = function(item){
     	//console.log('new');
  	$scope.tkid   = "new";
  	$scope.tkname = "new";
  	$scope.token  = "";
  	$scope.jwt    = "";
     };
     $scope.save = function(){
     	function final(err,response){
  		//console.log(err);
  		if(response){
  			//console.log(response);
  			if ($scope.tkid == "new"){
  				$scope.data.push(response.data.saved.rows[0]);
  				$scope.tkid = response.data.saved.rows[0].id;
  			} else {
  				$scope.data.forEach(function(item){
  					if(item.id == $scope.tkid){
  						item.token = response.data.saved.rows[0].token;
  						item.tname = response.data.saved.rows[0].tname;
  						item.jwt   = response.data.saved.rows[0].jwt;
  						$scope.jwt = response.data.saved.rows[0].jwt}
  				});
  			}
  			
  			$scope.jwt = response.data.saved.rows[0].jwt
  			$scope.tableParams.reload();
  		}
 	};
 	var data = {id:$scope.tkid,tname:$scope.tkname,token:$scope.token};
  	var req  = {method: 'POST',url: $rootScope.baseurl+'int/savetoken',data:data};
	gms($http,req,localStorage.ast,final);
     };
     function loadtokens(){
     	function final(err,response){
  		//console.log(err);
  		//console.log(response);
  		if(response){
  			response.data.tokens.forEach(function(row){$scope.data.push(row)});
  			$scope.tableParams.reload();
  			if($scope.data[0]){
  				$scope.tkid   = $scope.data[0].id;
  				$scope.tkname = $scope.data[0].tname;
  				$scope.token  = $scope.data[0].token;
  				$scope.jwt    = $scope.data[0].jwt;
  			};
  		};
 	};
     	var req  = {method: 'GET',url: $rootScope.baseurl+'int/loadtokens'};
	gms($http,req,localStorage.ast,final);
     };
     
     loadtokens();
     
     $scope.aceLoaded3 = function(_editor) {
	    // Options
	    //console.log('ACE loaded...');
	    //_editor.renderer.setShowGutter(true);
	    //_editor.setShowInvisibles(true);
	    _editor.setReadOnly(false);
	    _editor.setFontSize(16);
	    _editor.$blockScrolling = Infinity;
	    _editor.setOptions({
		    enableBasicAutocompletion: true
		});
	    $scope.acedit = _editor;
	  };
     
  }])
  .controller('RulesCtrl',['$rootScope','$scope','$http','$location', function ($rootScope,$scope,$http,$location){
  $scope.ccode = "//";
  $scope.showmenu = {bef:true,aft:true,aut:true,mod:false,chk:false,pub:false,bac:false};
  $scope.current  = ""
  $scope.menuback = false;
  $scope.published = false;
  $scope.editable = false;
  $scope.showcode = true;
  $scope.showhelp = false;
  $scope.prevmenu = {bef:true,aft:true,aut:true,mod:false,chk:false,pub:false,bac:false};
  $scope.showerror=false;
  $scope.cerr = "";
  $scope.pubmessage = "";
  $scope.publish = function(){
  	//console.log('PUB func');
  	function final(err,response){
  			//console.log(err);
  			//console.log(response);
  			if (err){
  				$scope.showerror=true;
  				$scope.cerr = err.data.error;
  				return 0;
  			}
  			if(response){
  				$scope.showmenu.pub = false;
  				$scope.published = true;
  			}
 		 };
 	var data = {fid:$scope.current};
  	var req  = {method: 'POST',url: $rootScope.baseurl+'int/pubjs',data:data};
	gms($http,req,localStorage.ast,final);
  };
  $scope.checkfunc = function(){
  	$scope.pubmessage = "";
  	//console.log('CHECK func');
  	function final(err,response){
  			//console.log(err);
  			//console.log(response);
  			if (err){
  				$scope.showerror=true;
  				$scope.cerr = err.data.error;
  				return 0;
  			}
  			if(response){
  				$scope.showmenu.pub = true;
  				//console.log($scope.showmenu.pub,'pub');
  			}
 		 };
 	var data = {fid:$scope.current};
  	var req  = {method: 'POST',url: $rootScope.baseurl+'int/checkjs',data:data};
	gms($http,req,localStorage.ast,final);
  
  };
  $scope.savecode = function(){
  		$scope.cerr = "";
  		$scope.showerror=false;
  		function final(err,response){
  			//console.log(err);
  			//console.log(response);
  			if(err){return err} // TODO
  			$scope.showmenu.mod = false;
  			$scope.showmenu.chk = true;
  			$scope.showmenu.bac = true;
  			$scope.published = false;
 		 };
 		var data = {fid:$scope.current,file:$scope.ccode};
  		var req  = {method: 'POST',url: $rootScope.baseurl+'int/putjs',data:data};
		gms($http,req,localStorage.ast,final);
  
  };
  $scope.hback = function(){
  	$scope.pubmessage = "";
  	$scope.showhelp = false;
  	$scope.showcode = true;
  	$scope.showmenu = $scope.prevmenu;
  	$scope.cerr = "";
  	$scope.showerror=false;
  };
  $scope.gethelp = function(){
  	$scope.pubmessage = "";
  	if ($scope.showhelp){return 0}
  	$scope.cerr = "";
  	$scope.showerror=false;
  	$scope.showhelp = true;
  	$scope.showcode = false;
  	$scope.prevmenu = $scope.showmenu;
  	$scope.showmenu = {bef:false,aft:false,aut:false,mod:false,chk:false,pub:false,bac:false};
  };
  $scope.cback = function() {
  	$scope.pubmessage = "";
  	$scope.cerr = "";
  	$scope.showerror=false;
  	$scope.current  = ""
  	$scope.editable = false;
  	$scope.ccode = "//";
  	$scope.showmenu = {bef:true,aft:true,aut:true,mod:false,chk:false,pub:false,bac:false};
  	$scope.menuback = false;
  };
  $scope.cancelcode = function(){
  	$scope.cback();
  };	
  $scope.changecode = function(){
  	$scope.pubmessage = "";
  	$scope.showmenu.pub = false;
  	if ($scope.editable){
  	$scope.showmenu.chk = false;
  	$scope.showmenu.mod = true;
  	$scope.showmenu.bac = false;
  	$scope.cerr = "";
  	$scope.showerror=false;
  	}
  }
  $scope.loadfile = function(jsfile){
  	$scope.published = false;
  	if($scope.showmenu.mod){return 0};
  	$scope.current  = jsfile;
  	if ($rootScope.rfls[jsfile]){$scope.ccode = $rootScope.rfls[jsfile]}
  	function final(err,response){
  			console.log(err);
  			if (err){return console.log(err)}
  			//console.log(response);
  			switch (jsfile) {
			    case 'rpdbefore':
				$scope.showmenu = {bef:true,aft:false,aut:false,mod:false,chk:true,pub:false,bac:true};
				break;
			    case 'rpdafter':
				$scope.showmenu = {bef:false,aft:true,aut:false,mod:false,chk:true,pub:false,bac:true};
				break;
			    case 'rpdauth':
				$scope.showmenu = {bef:false,aft:false,aut:true,mod:false,chk:true,pub:false,bac:true};
				break;
			}
			$scope.published = response.data.okcrc;
  			if(err){return $scope.ccode = jsfile + "_error = " +JSON.stringify(err.data) + ';'}
  			$scope.ccode = response.data.file;
  			$scope.editable = true;
  		};
  		var req = {method: 'GET',url: $rootScope.baseurl+'int/getjs',params:{atr:jsfile}};
		gms($http,req,localStorage.ast,final);
  };
  
  $scope.aceLoaded2 = function(_editor) {
	    // Options
	    //console.log('ACE loaded...');
	    //_editor.renderer.setShowGutter(true);
	    //_editor.setShowInvisibles(true);
	    _editor.setReadOnly(false);
	    _editor.setFontSize(16);
	    _editor.$blockScrolling = Infinity;
	    _editor.setOptions({
		    enableBasicAutocompletion: true
		});
	    $scope.acedit = _editor;
	  };
  
  }])
  .controller('NTabCtrl',['$rootScope','$scope','$http','$location', function ($rootScope,$scope,$http,$location){
 // '$https','$location', function ($rootScope,$scope,$https,$location)
 	//console.log("NTAbCtrl");
  	$scope.ceva  = 1;
  	$scope.seldb = "";
  	$scope.showtable = 0;
  	$scope.dbsel = [];
  	$scope.tablesnumber = 0;
  	$scope.tablesel = {};
  	$scope.fieldsel = {};
  	$scope.add_db = false;
  	$scope.srvdbs = [];
  	$scope.dbslist = $rootScope.mdb.databases.names;
  	$scope.add_dbname = "";
  	$scope.csql = {queryname:"",sqlstat:"",id:"new",db:"",inuse:false};
  	$scope.savecsql = angular.copy($scope.csql);
  	$scope.inerr = "";
  	$scope.spars = "";
  	$scope.smod = false;
  	$scope.selectedsql = "";
  	$scope.helpmode = false;
  	$scope.edth = {"height":"100%"};
  	$scope.shrun = false;
  	$scope.params = [];
  	$scope.runstat = "";
  	$scope.runtestmsg = "";
  	$scope.queryisok = false;
  	$scope.showdelete = false;
  	$scope.testurl = "";
  	$scope.showapitest = false;
  	// query functions
  	$scope.show_delete = function(ce){$scope.showdelete = ce};
  	$scope.validatesql = function(){
  		//console.log("VALIDATE SQL");
  		//B3CS0Q9RJGPCWS
  		function final(err,response){
  			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})}
  			if(response){
				//console.log(response);
				$scope.csql.inuse = true;
				$scope.runtestmsg = "Validated - OK";
				$rootScope.mdb.queries.forEach(function(item){
  					if (item.id == $scope.csql.id){
  						item.inuse = true;
  					};
  				});
  				delete $rootScope.mdb.esqls[$scope.savecsql.queryname]
  				var newrec = angular.copy($scope.csql)
  				$rootScope.mdb.sqls[$scope.csql.queryname] = newrec;
  			}
  		};
  		var req = {method: 'POST',url: $rootScope.baseurl+'int/validatesql',data:$scope.csql};
		gms($http,req,localStorage.ast,final);
  	}
  	$scope.qurl = function(ce,h){
  		//console.log(ce);
  		var burl = $rootScope.baseurl;
  		if (ce == 'rapid'){
  			if ($rootScope.rapicfg.protocol == 'HTTPS') {burl = $rootScope.rapicfg.protocol} else {burl = 'HTTP'}
  			burl = burl + '://' + $location.host() + ':' + $rootScope.rapicfg.port + '/'
  		}
  		var url = burl+ce+'/rpdquery?csql='+$scope.csql.queryname;
  		$scope.params.forEach(function(p){url = url + '&' + p.par + '=';
  			if(h==1){url=url+p.value} else {url=url+'val'};
  		});
  		url = url + '&offset=0&limit=0';
  		//if (ce=='rapid'){$scope.runstat = angular.toJson({url:url}, true)};
  		return url;
  	};
  	$scope.testrun = function(){
  		if ($scope.smod){return $scope.runtestmsg = "Please save changes first."};
  		$scope.runtestmsg = "....";
  		$scope.queryisok  = false;
  		var url = $scope.qurl('int',1);
  		function final(err,response){
  			if(err){$scope.testurl = "";$scope.runtestmsg = "Response: ERROR";$scope.runstat=angular.toJson(err, true)}
  			if(response){
  				$scope.testurl = $scope.qurl('rapid',1)+'&token='+response.data.testtoken;
  				console.log($scope.testurl);
  				//console.log(response.data);
  				//$scope.testtoken = response.data.testtoken;
  				$scope.showapitest = true;
  				delete response.data.testtoken;
  				$scope.runstat = angular.toJson(response.data, true);
  				$scope.runtestmsg = "Response: OK";
  				if (!$scope.csql.inuse){$scope.queryisok  = true};
  			}
  		};
  		var req = {method: 'GET',url: url,data:$scope.csql};
		gms($http,req,localStorage.ast,final);
  	};
  	$scope.sqldelete = function(){
  		$scope.showapitest = false;
  		$scope.showdelete = false;
  		if ($scope.csql.id == 'new'){
  			$rootScope.mdb.queries.forEach(function(item){
  				if (item.queryname==$scope.csql.queryname){
  					$scope.csql.id = item.id;
  				}
  			});
  		};
  		if ($scope.csql.id == 'new'){return $scope.csql = {queryname:"",sqlstat:"",id:"new",db:"",inuse:false}};
  		function final(err,response){
  		
  			if(err){}
  			if(response){
  				delete $rootScope.mdb.sqls[$scope.csql.queryname]
  				delete $rootScope.mdb.esqls[$scope.csql.queryname]
  				var i = 0;
  				$rootScope.mdb.queries.forEach(function(item){
  					
  					if (item.id == $scope.csql.id){
  						console.log(item);
  						$rootScope.mdb.queries.splice(i);
  					};
  					i++
  				});
  				$scope.csql = {queryname:"",sqlstat:"",id:"new",db:"",inuse:false};
  			}
  		};
  		var req = {method: 'POST',url: $rootScope.baseurl+'int/deletesql',data:$scope.csql};
  		gms($http,req,localStorage.ast,final);
  	};
  	$scope.cancelrun = function(){
  		$scope.showapitest = false;
  		$scope.showdelete = false;
  		$scope.edth = {"height":"100%"};
  		$scope.shrun = false;
  		$scope.runstat = "";
  		$scope.runtestmsg = "";
  		$scope.queryisok  = false;
  	};
  	$scope.showrun = function(){
  		$scope.showapitest = false;
  		$scope.showdelete = false;
  		$scope.queryisok  = false;
  		$scope.edth = {"height":"40%"};
  		$scope.shrun = true;
  	};
  	$scope.aceLoaded = function(_editor) {
	    // Options
	    console.log('ACE loaded...');
	    //_editor.renderer.setShowGutter(true);
	    //_editor.setShowInvisibles(true);
	    _editor.setReadOnly(false);
	    _editor.setFontSize(16);
	    _editor.$blockScrolling = Infinity;
	    $scope.acedit = _editor;
	  };
	  $scope.aceLoaded0 = function(_editor) {
	    // Options
	    console.log('ACE loaded...');
	    //_editor.renderer.setShowGutter(true);
	    //_editor.setShowInvisibles(true);
	    _editor.setReadOnly(true);
	    _editor.setFontSize(16);
	    _editor.$blockScrolling = Infinity;
	    $scope.acedit = _editor;
	  };
  	
  	$scope.sc_cancel = function(){
  		$scope.showapitest = false;
  		$scope.showdelete = false;
  		//console.log('cancel');
  		$scope.inerr = "";
  		$scope.runtestmsg = "";
  		$scope.csql = angular.copy($scope.savecsql);
  		$scope.smod = false;
  		$scope.selectedsql = $scope.savecsql.queryname;
  		
  	};
  	$scope.sqlcheck = function(s){
  		$scope.showapitest = false;
  		$scope.showdelete = false;
  		if (s == $scope.savecsql.sqlstat){$scope.smod = false} else {
  			$scope.queryisok = false;
  			$scope.smod = true};
  		$scope.inerr = "";
  		try {
  		if (s.search("&")>-1){
  			var arr = s.match(/(^|\s)&(\w+)/g).map(function(v){return v.trim().substring(1);});
  			$scope.params = [];
  			arr.forEach(function(item){var np={par:item,value:null};$scope.params.push(np)});
  			$scope.spars = "Parameters: "+k2l(arr);
  		} else {$scope.spars = "";$scope.params =[]};
  		} catch(err){};

  	};
  	$scope.qncheck = function(qname){
  		$scope.queryisok = false;
  		$scope.smod = true;
  		$scope.inerr = "";
  		var rq = check35(qname);
  		$scope.csql.queryname = rq;
  		
  		if ($rootScope.mdb.esqls[rq] && $scope.csql.id != $rootScope.mdb.esqls[rq].id){$scope.inerr = rq + " - Query name exist!"};
  		if ($rootScope.mdb.sqls[rq] && $scope.csql.id != $rootScope.mdb.sqls[rq].id){$scope.inerr = rq + " - Query name exist!"};
  	};
  	$scope.qsel = function(q){
  		$scope.showapitest = false;
  		$scope.showdelete = false;
  		$scope.helpmode = false;
  		if ($scope.smod){ return $scope.inerr = "There are changes, please press SAVE or CANCEL before other selection!"}
  		$scope.smod = false;
  		$scope.inerr = "";
  		//console.log(q);
  		$scope.csql = {queryname:q.queryname,inuse:q.inuse,id:q.id,db:q.dbs}
  		if (q.inuse){$scope.csql.sqlstat = $rootScope.mdb.sqls[q.queryname].sqlstat} else {
  		$scope.csql.sqlstat = $rootScope.mdb.esqls[q.queryname].sqlstat}
  		$scope.savecsql = angular.copy($scope.csql);
  		$scope.sqlcheck($scope.csql.sqlstat);
  		$scope.runstat = "";
  		$scope.runtestmsg = "";
  		$scope.cancelrun();
  	};
  	$scope.sqlcreate = function(){
  		$scope.showdelete = false;
  		//console.log("SQL ADD");
  		//$scope.csql.db="hr" // test data
  		if ($scope.csql.db.length === 0){return $scope.inerr = "Database name is required. Select a database first!"};
  		function final(err,response){
  			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})}
  			if(response){
  				$scope.smod = false;
  				var newrec = angular.copy($scope.csql)
  				newrec.id = response.data.item.id;
  				$rootScope.mdb.esqls[$scope.csql.queryname] = newrec;
  				newrec.dbs   = newrec.db;
  				newrec.inuse = false;
  				$rootScope.mdb.queries.push(newrec);
  			}
  		};
  		var req = {method: 'POST',url: $rootScope.baseurl+'int/newsql',data:$scope.csql};
		gms($http,req,localStorage.ast,final);
  	};
  	
  	$scope.sqlsave = function(){
  		$scope.showdelete = false;
  		$scope.queryisok  = false;
  		//console.log('csql',$scope.csql);
  		$scope.qncheck($scope.csql.queryname);
  		if ($scope.inerr != ""){return $scope.inerr = "CHECK: "+$scope.inerr};
  		if (!$scope.csql.queryname){return $scope.inerr = "Query name is required! "}
  		if (!$scope.csql.sqlstat){return $scope.inerr = "Query SQL is required! "}
  		if ($scope.csql.id=="new"){return $scope.sqlcreate()}
  		//console.log("SQL SAVE");
  		function final(err,response){
  			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})}
  			if(response){
  				//console.log(response);
  				$scope.smod = false;
  				delete $rootScope.mdb.sqls[$scope.savecsql.queryname]
  				delete $rootScope.mdb.esqls[$scope.savecsql.queryname]
  				var newrec = angular.copy($scope.csql)
  				$rootScope.mdb.esqls[$scope.csql.queryname] = newrec;
  				newrec.dbs   = newrec.db;
  				newrec.inuse = false;
  				$scope.csql.inuse = false;
  				$scope.runtestmsg = "";
  				$rootScope.mdb.queries.forEach(function(item){
  					if (item.id == $scope.csql.id){
  						item.queryname = $scope.csql.queryname;
  						item.inuse = false;
  						
  						$scope.qsel(item);
  					};
  				});
  			}
  		};
  		var req = {method: 'POST',url: $rootScope.baseurl+'int/savesql',data:$scope.csql};
		gms($http,req,localStorage.ast,final);
  	};
  	$scope.showhelp = function(x){
  		$scope.showdelete = false;
  		//console.log('HELP');
  		$scope.helpmode = x
  		if(x){$scope.qurl('rapid',0)}};
  		//console.log($scope.helpmode)
  	$scope.sqladdnew = function(){
  		$scope.showdelete = false;
  		$scope.helpmode = false;
  		$scope.smod = true;
  		$scope.csql.queryname = "new";
  		$scope.csql.sqlstat = "";
  		$scope.csql.id = "new";
  		$scope.csql.db = "";
  		$scope.csql.inuse = false;
  		$scope.cancelrun();
  	};
  	//
  	// database functions
  	$scope.adddatabase = function(ce){
  		//console.log(ce);
  		function getdata(err,response){
  			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})}
	  		if(response){
	  			//console.log(response);
				if (response.msg="OK"){
					$scope.srvdbs = [];
					$scope.add_db = false;
					$scope.$emit('reloadmdb', 'reload');
				}
			};
  		};
  		var req = {
		      method: 'POST',
		      url: $rootScope.baseurl+'int/adddbs',
		      data:{dbname:ce}};
		gms($http,req,localStorage.ast,getdata);
  	};
  	$scope.get_dbs = function(){
  		$scope.errmsg = "";
  		function getdata(err,response){
  			if(err){$scope.errmsg = "Server error, please try again.";console.log({error:err})}
  			if(response){
	  			if (response.msg="OK"){
					$scope.add_db = true;
					$scope.srvdbs = [];
					response.data.data.forEach(function(db){
						if(!$rootScope.mdb.databases[db]){$scope.srvdbs.push(db)};
					});
				};
  			};
  		};
  		var req = {
		      method: 'GET',
		      url: $rootScope.baseurl+'int/getdbs'
		      }
		gms($http,req,localStorage.ast,getdata);
  	};
  	$scope.cancel = function(){$scope.add_db = false};
  	$scope.fk = function(field){
  		//console.log(field);
  		$scope.fieldsel = field;
  		$scope.showtable=3;
  	};
  	$scope.tk = function(tbl){
  		//console.log(tbl);
  		$scope.tablesel = tbl;
  		$scope.showtable=2;
  	};
  	$scope.sk = function(ce){
  		//console.log(ce);
  		$scope.showtable=1;
  		$scope.seldb = ce;
  		if($rootScope.mdb.dbtables[ce]){$scope.dbsel = $rootScope.mdb.dbtables[ce]} else {$scope.dbsel=[]}
  		//console.log($scope.dbsel);
  		$scope.tablesnumber = $scope.dbsel.length;
  	};
  	// end database
  }])
  .directive('tabHighlight', [function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        // Here is the major jQuery usage where we add the event
        // listeners mousemove and mouseout on the tabs to initalize
        // the moving highlight for the inactive tabs
        var x, y, initial_background = '#c3d5e6';

        element
          .removeAttr('style')
          .mousemove(function (e) {
            // Add highlight effect on inactive tabs
            if(!element.hasClass('active'))
            {
              x = e.pageX - this.offsetLeft;
              y = e.pageY - this.offsetTop;

              // Set the background when mouse moves over inactive tabs
              element
                .css({ background: '-moz-radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.0) 45px), ' + initial_background })
                .css({ background: '-webkit-radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.0) 45px), ' + initial_background })
                .css({ background: 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.0) 45px), ' + initial_background });
            }
          })
          .mouseout(function () {
            // Return the inital background color of the tab
            element.removeAttr('style');
          });
      }
    };
  }]);
