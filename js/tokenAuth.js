
/**
 * Token Authorization for EXPRESS servers.
 *
 */
utils = require('./fgen.js');

module.exports = function(req, res, next) {
    var token;
    req.session = null;
    //console.log(req.headers.authorization);
    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
	//console.log(parts);
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
    
    //console.log(token)

    utils.vt(token, function(err, token) {
        if (err) {return res.status(401).send({err: 'The token is not valid'})};
        //console.log(token);
        req.token = token;
        next();
    });
};
