module.exports = {
	newUTCdate: function(){
		var d = new Date();
		var md = {}
		md.datestring = d
		md.utctime = d.getTime();
		md.utc = d.getUTCFullYear()+'/'+(d.getUTCMonth()+1)+'/'+d.getUTCDate()+' '+ d.getUTCHours()+':'+d.getUTCMinutes()+':'+d.getUTCSeconds()+ '.'+d.getUTCMilliseconds()
		return md;
	},
	setUTCdate: function(opt){
		if (opt.miliseconds){
			var d = new Date(opt.year,opt.month-1,opt.day,opt.hour,opt.minute,opt.seconds);
			d.setUTCMilliseconds(opt.miliseconds)
			var md = {}
			md.datestring = d
			md.utc = d.getUTCFullYear()+'/'+(d.getUTCMonth()+1)+'/'+d.getDate()+' '+ d.getUTCHours()+':'+d.getUTCMinutes()+':'+d.getUTCSeconds()+ '.'+d.getUTCMilliseconds()
			return md
		}
	},
	getDateOpt: function(date){
		var c1 = date.split("/");		
		var options = {}
		options.year = parseInt(c1[0]);
		options.month = parseInt(c1[1]);
  		var c2 = c1[2].split(" ");
		options.day = parseInt(c2[0]);
		var c3 = c2[1].split(":");
		options.hour = parseInt(c3[0])
		options.minute = parseInt(c3[1])
		var c4 = c3[2].split(".");
		options.seconds = parseInt(c4[0]);
		if (parseInt(c4[1])){
		options.miliseconds = parseInt(c4[1])} else {options.miliseconds = 0};
		return options;
	}
}
