/*
 * Token Authorization for EXPRESS servers.
 * Bearer token based on JWT ( json web token)
 */
 
utils   = require('./fgen.js');
crypto  = require('crypto');
jwt     = require('jsonwebtoken');

module.exports = function(req,res,next){
    var token;
    //req.session = null;
    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            var scheme = parts[0],
                credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            return res.json(401, {err: 'Format is Authorization: Bearer <token>'});
        }
    } else if (req.query.token) {
        token = req.query.token;
        delete req.query.token;
    } else {
        return res.status(401).send({err: 'No Authorization header was found'});
    }
    function final(err,tokendata){
    		if(err){return res.json(401, {err: 'Bad JWT token'})}
    		req.token = tokendata;
    		return next();
    	}
	
    jwt.verify(
        token, // The token to be verified
        process.env.token_key, // token secret
        {}, // Options, none in this case
        final // The callback to call when the verification is done. (return err/token data)
    );
};
