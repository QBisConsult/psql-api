var pg = require('pg');
require('pg-spice').patch(pg);
var utils = require('./fgen.js')

module.exports = {
	getdbdist: function(dbname,username){
		// modify this function according with your distributed database policy
		return dbname + '_' + utils.hash(username.toLowerCase(),1).toLowerCase()
	},
	getclient: function(pars){
		var conString = 'postgres://'+pars.user+':'+pars.password+'@'+pars.host+':'+pars.port+'/'+pars.rapiddb
		return new pg.Client(conString)
 	},
	transaction: function(client,action,qcb) {
		client.query(action,function(err,tresult) {
		if(err) {
      			qcb({error:err},'');
    			} else {
			qcb('',tresult);
			}
		})
	},
	getsql: function(client,sqlstat,qp,limit,offset,qcb){
		//console.log(limit==0)
		//console.log(offset==0)
		if (limit == 0) {} else {
			sqlstat = sqlstat + ' limit ' + limit;
			if (offset == 0){} else {sqlstat = sqlstat + ' offset ' + offset};
		};
		//console.log(sqlstat);
		//console.log(qp);
		client.query(sqlstat,qp,function(err,tresult) {
			if (err) {
				qcb({error:err},'');
			} else {
				qcb('',tresult.rows);
			};
		});
	},
	runquery: function(client,query,query_values,returntype,qcb){
		
		client.query(query,query_values,function(err,tresult) {   
		if(err) {
      			qcb({error:err},'');
    			} else {
			qcb('',tresult);
			//console.log(returntype)
			}
		})
	},
	insert: function(client_PGI,table_PGI,values_PGI,returntype,qcb){
		//console.log(values_PGI);
		var fields_PGI = ""
		var flds_PGI = ""
		var fldsvalues_PGI = []
		var hascoma_PGI = ""
		var fldnro_PGI = 0
		var has_delimiter = ''
		for (var fldname_PGI in values_PGI){
			fldnro_PGI = fldnro_PGI + 1
			if (fields_PGI.length>0){hascoma_PGI=','}
			fields_PGI = fields_PGI + hascoma_PGI +'"'+fldname_PGI+'"'
			flds_PGI   = flds_PGI + hascoma_PGI + '$'+fldnro_PGI
			fldsvalues_PGI.push(values_PGI[fldname_PGI])
		};
		fields_PGI = '('+fields_PGI + ')'	
		flds_PGI   = '('+flds_PGI + ')'
		
		var tsql_string = 'INSERT INTO ' + table_PGI +' ' +fields_PGI + ' VALUES ' + flds_PGI + ' RETURNING *'
		//console.log(tsql_string);
		//console.log(fldsvalues_PGI)
		client_PGI.query(tsql_string,fldsvalues_PGI,function(err,tresult){   
		if(err) {
      			qcb({error:err},'');
    			} else {
			qcb('',tresult);
			}
		})
	},
	update: function(client_PGI,table_PGI,primary_key,key_value,values_PGI,returntype,qcb){
		
		var fields_PGI = ""
		var flds_PGI = ""
		var fldsvalues_PGI = []
		var hascoma_PGI = ""
		var fldnro_PGI = 0
		var has_delimiter = ''
		for (var fldname_PGI in values_PGI){
			//console.log(fldname_PGI);
			if (fldname_PGI != primary_key){
				fldnro_PGI = fldnro_PGI + 1
				if (fields_PGI.length>0){hascoma_PGI=','}
				fields_PGI = fields_PGI + hascoma_PGI +'"'+fldname_PGI+'"'
				flds_PGI   = flds_PGI + hascoma_PGI + '$'+fldnro_PGI
				fldsvalues_PGI.push(values_PGI[fldname_PGI])};
		}
		fields_PGI = '('+fields_PGI + ')'	
		flds_PGI   = '('+flds_PGI + ')'
		fldnro_PGI = fldnro_PGI + 1
		fldsvalues_PGI.push(key_value)

		var tsql_string = 'UPDATE ' + table_PGI +' set ' +fields_PGI + '=' + flds_PGI + ' where '+primary_key+'=$'+fldnro_PGI+' RETURNING *'
		//console.log(tsql_string);
		//console.log(fldsvalues_PGI);
		
		client_PGI.query(tsql_string,fldsvalues_PGI,function(err,tresult){   
		if(err) {
      			qcb({error:err},'');
    			} else {
			qcb('',tresult);
			}
		})
	},
	get_fields: function(table_structure,primary_key,irequest,ck_insert,table_name){
		var table_flddet = process.rapidcfg.mdb.tables.structures[table_name]
		if (!irequest[primary_key]){irequest[primary_key] = utils.uuid()};
		if (table_structure.updatedAt){
			var date_PGI = new Date();
			irequest.updatedAt = date_PGI.toISOString()};				
		if (table_structure.deleted){irequest.deleted = false};	
		var check_names_error = 'error'
		for (var fldname in irequest){
			if (!table_structure[fldname]){ check_names_error = check_names_error +'/'+fldname + ' - not a table field'};
		}
		if (check_names_error != 'error') {return {error:'Insert request error',rapidinsertfields_error:{error:check_names_error}}}
		if (ck_insert==1){
		if (table_structure.createdAt){
			var date_PGI = new Date();
			irequest.createdAt = date_PGI.toISOString()};
		var check_mandatory_error = 'error'		
		for (var fldname in table_structure){
			if (table_flddet[fldname].is_nullable == 'NO') {
			if (irequest[fldname] == undefined){ check_mandatory_error = check_mandatory_error +'/<'+fldname+'> - required field(!null)'}};

		}
		if (check_mandatory_error != 'error') {return {error:'Insert request error',rapidinsertfields_error:check_mandatory_error}}
		}
		
		return irequest
	}
}
