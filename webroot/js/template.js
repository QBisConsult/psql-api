	function getdata(err,response){
		if(err){}
		if(response){
	  			
		};
	};

	gms($http,req,false,getdata);


//--------------------------------------------------------


    	$scope.reload = function(){
    		console.log('reload');
    		$scope.errmsg="";
    		var req = {
		      method: 'GET',
		      url: 'http://'+ $location.host() +':3330/int/reload',
		      headers: {
			 'Content-Type': "application/json; charset=utf-8",
			 'Authorization': localStorage.ast}};
		$http(req).then(function(response){
			console.log(response);
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
		}, function (x) {$scope.errmsg = "Server error, please try again.";console.log({error: x})});
    	};


	    	$scope.savecfg = function(twh){
    		console.log("savecfg",twh);
    		console.log($scope.con);
    		$scope.con.action = twh;
    		$scope.errmsg = "";
    		var req = {
		      method: 'POST',
		      url: 'http://'+ $location.host() +':3330/setup',
		      headers: {
			 'Content-Type': "application/json; charset=utf-8",
			 'Authorization': localStorage.ast},
		      data:$scope.con	 
			}
		$http(req).then(function(response){
			console.log(response);
			$scope.prevsc = $scope.stepcaption;
			$scope.stepcaption = "Configuration complete"
			$rootScope.rl = false;
			$rootScope.sysok = true;
			if (response.data.error){$scope.step=5}
			if (!response.data.error){$scope.step=6;console.log("saved")};
		}, function (x) {$scope.errmsg = "Server error, please try again.";console.log({error: x})});
    	};

    	$scope.checkrcfg = function(){
    		console.log("checkrcfg");
    		console.log($scope.con);
    		var defdb = $scope.con.db;
    		$scope.con.db = "rcfg";
    		delete $scope.con.action;
    		var req = {
		      method: 'POST',
		      url: 'http://'+ $location.host() +':3330/setup',
		      headers: {
			 'Content-Type': "application/json; charset=utf-8",
			 'Authorization': localStorage.ast},
		      data:$scope.con	 
			}
		$http(req).then(function(response){
			//console.log(response);
			$scope.con.db = defdb;
			$scope.prevsc = $scope.stepcaption;
			$scope.stepcaption = "Configuration"
			if (response.data.error){$scope.step=2}
			if (!response.data.error){$scope.step=4};
		}, function (x) {$scope.con.db = defdb;$scope.errmsg = "Server error, please try again.";console.log({error: x})});
    	}

    	$scope.dbcheck = function(con){
    		$scope.errmsg = "";
    		delete $scope.con.action;
	    	var req = {
		      method: 'POST',
		      url: 'http://'+ $location.host() +':3330/setup',
		      headers: {
			 'Content-Type': "application/json; charset=utf-8",
			 'Authorization': localStorage.ast},
		      data:con	 
			}	
		$http(req).then(function(response){
			console.log(response);
			$scope.prevsc = $scope.stepcaption;
			$scope.stepcaption = "Check database access rights"
			$scope.subcaption = ""
			if (response.data.error){$scope.errmsg = response.data.error + '/ ' +response.data.errmsg}
			if (!response.data.error){$scope.step=1;};
		}, function (x) {$scope.errmsg = "Server error, please try again.";console.log({error: x})});
    	}

    $scope.reloadmdb = function(){
    	var req = {
		      method: 'GET',
		      url: 'http://'+ $location.host() +':3330/int/reload',
		      headers: {
			 'Content-Type': "application/json; charset=utf-8",
			 'Authorization': localStorage.ast}};
		$http(req).then(function(response){
			if (response.data.mdb){
				response.data.mdb.dbtables = {};
				response.data.mdb.tables.names.forEach(function(table){
					var idb = response.data.mdb.tables.db[table]
					if (!response.data.mdb.dbtables[idb]){response.data.mdb.dbtables[idb]=[]};
					var tbl = {tablename:table};
					var fields = [];
					var flds = Object.keys(response.data.mdb.tables.structures[table]);
					flds.forEach(function(field){
						var fld = {fname:field}
						fld.detail = response.data.mdb.tables.structures[table][field]
						fields.push(fld);
					});
					tbl.fields = fields;
					response.data.mdb.dbtables[idb].push(tbl);
				});
				console.log(response.data.mdb);
				$rootScope.mdb   = response.data.mdb;
				$scope.configuration = response.data.mdb;
				$scope.configuration.username = $scope.username;
			};
		}, function (x) {$scope.errmsg = "Server error, please try again.";console.log({error: x})});
    };


    $scope.setfirstpass = function(tu,tp,rtp){
    	$scope.errmsg = "";
    	$scope.cms = "";
    	$scope.ls = 3;
    	if (tp != rtp){return $scope.cms = "Please retype paswords, do not match!"}
    	var req = {
	      method: 'POST',
	      url: 'http://'+ $location.host() +':3330/pset',
	      headers: {
		 'Content-Type': "application/json; charset=utf-8"},
		data:{usr:tu,pwd:tp}}
	if (!$scope.isnew){
		req.headers.Authorization = localStorage.ast;
	};	
	$http(req).then(function(response){
		console.log(response,$scope.ls);
		$scope.ls=3;
		localStorage.username = tu;
		}, function (x) {$scope.errmsg = "Server error, please try again later or contact an administrator";console.log({error: x})});

    };
    
        $scope.tlogin = function(u,p){
	localStorage.username = u;
	var p = getAuth(u+':'+p);
	localStorage.ast = p
	var req = {
	      method: 'GET',
	      url: 'http://'+ $location.host() +':3330/login',
	      headers: {
		 'Content-Type': "application/json; charset=utf-8",
		 'Authorization': p}
		}
	$http(req).then(function(response){
		//console.log(response);
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
		}, function (x) {$scope.errmsg = "Server error, please try again later or contact an administrator";console.log({error: x})});
    };
 
     $scope.loadmdb = function(){
    	var req = {
		      method: 'GET',
		      url: 'http://'+ $location.host() +':3330/int/getmdb',
		      headers: {
			 'Content-Type': "application/json; charset=utf-8",
			 'Authorization': localStorage.ast}};
		$http(req).then(function(response){
			//console.log(response);
			if (response.data.mdb){
				response.data.mdb.dbtables = {};
				response.data.mdb.tables.names.forEach(function(table){
					var idb = response.data.mdb.tables.db[table]
					if (!response.data.mdb.dbtables[idb]){response.data.mdb.dbtables[idb]=[]};
					var tbl = {tablename:table};
					var fields = [];
					var flds = Object.keys(response.data.mdb.tables.structures[table]);
					//console.log(table,flds);
					flds.forEach(function(field){
						var fld = {fname:field}
						fld.detail = response.data.mdb.tables.structures[table][field]
						fields.push(fld);
					});
					tbl.fields = fields;
					response.data.mdb.dbtables[idb].push(tbl);
				});
				console.log(response.data.mdb);
				$rootScope.mdb   = response.data.mdb;
				$scope.configuration = response.data.mdb;
				//$scope.joker = response.data.mdb.databases.number
				$scope.configuration.username = $scope.username;
				//console.log($scope.joker);
			};
		}, function (x) {$scope.errmsg = "Server error, please try again.";console.log({error: x})});
    };
 
