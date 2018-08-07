const express = require('express');
const routes = require('../routes');
const app = express();
const expressValidator = require('express-validator');
const env =  require('../config/env.json');
const credentials =  require('../config/credentials.json');
const config = require('../config/'+ env.ENVIRONMENT +'.json');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose");
const dbURI = `mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
const {errorHandler} = require("../util/util");

require(path.join(__dirname, '../util/dataBase'))(mongoose, dbURI, config.DEBUG);

app.use(expressValidator());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use( function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT ,DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Cache-Control, Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-Access-Token, token');
    
    if(req.method === 'OPTIONS') {
        res.status(200).end();
      } else {
        next();
      }});

app.use(express.static(path.join(__dirname, '..', 'files')));


// import Routes
app.use('/backoffice', routes.backoffice);
app.use('/b2b', routes.userb2b);
app.use('/b2c', routes.userb2c);

app.set('privateKey', credentials.privateKey);

app.listen(config.SERVER_PORT, function () {
    console.log('Server listen on Port :'+ config.SERVER_PORT)
});

module.exports = app;
