function getAuth(auth_string) {
    var bytes  = Crypto.charenc.Binary.stringToBytes(auth_string);
    var base64 = Crypto.util.bytesToBase64(bytes);
    return "Basic " + base64;
}

function base64enc(lcstring) {
    var bytes  = Crypto.charenc.Binary.stringToBytes(lcstring);
    var base64 = Crypto.util.bytesToBase64(bytes);
    return base64;
}

function base64dec(base64) {
    bytes  = Crypto.util.base64ToBytes(base64);
    var lcstring = Crypto.charenc.Binary.bytesToString(bytes);
    return lcstring;
}

function uuid() {
    var d = new Date().getTime();
    var uuid_ = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(36);
    });
    return uuid_;  
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function searchinarray(sarr,sname,svalue){
        var rarr = [];
        for (var sloop = 0; sloop < sarr.length; sloop++) {
		if(!svalue){			
			rarr.push(sarr[sloop][sname])} else {
                if (sarr[sloop][sname].toLowerCase() == svalue.toLowerCase()){rarr.push(sarr[sloop])}}};
        return rarr
}
function getarrindex(sarr,kname,kvalue){
	var reind = -1
	//console.log(kname)
	//console.log(kvalue)
	for (var sloop = 0; sloop < sarr.length; sloop++) {			
                if (sarr[sloop][kname].toLowerCase() == kvalue.toLowerCase()){
			reind = sloop}};
	return reind
}	
function hash(calculatestring,lnkeysize) {
 var o_pop = function(lnstr,lnvar,lnpos,lcstring)
 {
	if (lnpos > lnvar){
		iii = lnvar*7;
	}
	else {iii = lnvar*2};
	pgret = parseInt('1136894519164713452378365432491863251956031744134837'.substring((lnpos-1)*2,lnpos*2))
	hhh = pgret + iii - Math.floor((pgret+iii)/lnvar)*lnvar
	ttt = lcstring.charCodeAt(hhh)
	mmm = ttt + pgret + lnstr - Math.floor((ttt+pgret+lnstr)/25)*25
	return String.fromCharCode(65+mmm);
	};
	var calcr = function(lcstr){
		uuu = lcstr.trim().length
		goo = 0
		for (i = 0; i<uuu;i++){
			goo = goo + lcstr.charCodeAt(i)*i;
		}
		return goo
  	}
  lncalc = calcr(calculatestring);
  uuu = calculatestring.trim().length
  finalstr = ""
  if (lnkeysize>26){lnkeysize=26};
  for (i=1;i<lnkeysize+1;i++){
     finalstr = finalstr + o_pop(lncalc,uuu,i,calculatestring)
  }
  return finalstr
 }
 
function check35(s){str = s.split('');var res = "";str.forEach(function(c){var asc = c.charCodeAt(0);if (asc>=48 && asc<=57){res=res+c};if (asc>=97 && asc<=122){res=res+c};if (asc>=65 && asc<=90){res=res+c}});return res.toLowerCase()}

function k2l(f,sep){
 	var result = "";
 	if(!sep){sep=""};	
	var oba = Object.keys(f);
	var hc = "";
	oba.forEach(function(key){
		var tpe = typeof f[key];
		if(tpe=='string'){result = result + hc + sep + f[key]+sep} else {
		result = result + hc + f[key]}
		hc = ",";
	})
	return result;
 }



