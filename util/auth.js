const errors = require('../util/constError');
const {httpErrors, decryptTokenData, httpSuccess}=require('./util');
const jwt = require('jsonwebtoken');

module.exports  = {
    verifyToken,
    createToken,
    validateToken
};

function verifyToken(req, res, next) {
    let token;

    token = (req.query && req.query.token) || (req.body && req.body.token)
        || (req.headers &&req.headers.token) || (req.params && req.params.token);

    if(token)
        jwt.verify(token, req.app.get("privateKey"), function(err, decoded) {
            if(decoded !== undefined )
            {
                console.log(decoded);
                req.user =JSON.parse(decryptTokenData(decoded.data, req.app.get("privateKey"))) ;
                next();
            }
            else
                httpErrors(res, 401, errors.ERR_AUTH)
        });
    else
        httpErrors(res, 401, errors.ERR_AUTH)
}

function validateToken(req, res, next){
    httpSuccess(res, 200, {success : true})
}

function createToken (data, expiresIn, key){

    return jwt.sign({data}, key, {expiresIn});
}