const bcrypt = require('bcrypt-node');
const crypto = require('crypto');

module.exports = {
    httpErrors,
    crypt,
    httpSuccess,
    errorHandler,
    cryptTokenData,
    decryptTokenData
};

function httpErrors(res, code, data) {
    let listError = [];
    error = {};
    error.success=false;
    //typeof  data != "string" ? listError = data.map(err => err.msg) : listError[0] = data;
    error.messages = listError;
    console.log(JSON.stringify(data));
    res.status(code).json(error)
}

function httpSuccess(res, code, result) {
    let json = {};
    json.success=true;
    json.data= result;
    //console.log(JSON.stringify(json));
    res.status(code).json(json)
}

function crypt(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}


function cryptTokenData(data, key) {
    let cipher = crypto.createCipher("aes-256-cbc",key);
    let crypted = cipher.update(JSON.stringify(data),'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decryptTokenData(data, key) {
    let decipher = crypto.createDecipher("aes-256-cbc",key);
    let dec = decipher.update(data,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.render('error', { error: err });
}
