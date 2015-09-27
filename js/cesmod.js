pem = require('pem');
fs  = require('fs');


module.exports = {
	newcertificate:function(copt,name,path,next){ //  service  ./ssl/
		var copt1 = {}
		pem.createPrivateKey(2048,n1);
		function n1(err,key){
			if (err){return next(err)}
			copt1.serviceKey = key.key;
			fs.writeFileSync(path + name + 'sign.key', key.key);
			pem.createCSR(copt,n2);
		};
		function n2(err,csr){
			if (err){return next(err)}
			//console.log(csr);
			copt1.selfSigned = true;
			copt1.csr  = csr.csr;
			copt1.days = copt.days;
			pem.createCertificate(copt1, n3)
		};
		function n3(err,cert){
			if (err){return console.log(err)}
			//console.log(cert);
			fs.writeFileSync(path + name + '.crt', cert.certificate);
			fs.writeFileSync(path + name + '.key', cert.serviceKey);
			next(false,cert);
		};
	},
	readcertificate:function(certificate,next){
		pem.readCertificateInfo(certificate, next);
	},
	readpubkey:function(c,next){
		pem.getPublicKey(c, next)
	}
}
