var crypto  = require('crypto'),
algorithm = 'aes-256-ctr'

module.exports = {
	enc:function(text,pwd){
		var pass = pwd || process.env.co,cipher=crypto.createCipher(algorithm,pass),c=cipher.update(text,'utf8','hex');
		c += cipher.final('hex');
		return c;
	},
	dec:function(text,pwd){
		var pass = pwd || process.env.co,decipher=crypto.createDecipher(algorithm,pass),d=decipher.update(text,'hex','utf8');
		d += decipher.final('utf8');
		return d;
	}
}
