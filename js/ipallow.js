module.exports.checkip = function(req,iplist){
	//console.log(process.memoryUsage());
	//if (process.memoryUsage().rss>83853312){process.exit(9)}
	if(!process.rapidcfg.ipallow){process.rapidcfg.ipallow=[]}
	if(process.rapidcfg.ipallow.length>0){
			var s = req.connection.remoteAddress;
		 	var a = s.split(':')
			var ip = a[a.length-1];
			return utils.findin(iplist,ip)
	} else {return true}
}

/*

var ip_address = null;
if(req.headers['x-forwarded-for']){
    ip_address = req.headers['x-forwarded-for'];
}
else {
    ip_address = req.connection.remoteAddress;
}
sys.puts( ip_address );



http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/x-forwarded-headers.html

*/

