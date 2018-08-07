const env =  require('../config/env.json')
const config = require('../config/'+ env.ENVIRONMENT +'.json')
const {Observable} = require('rx');
const {fromPromise, combineLatest} = Observable;
const bcrypt = require('bcrypt-node');
const MongoClient = require('mongodb').MongoClient;


MongoClient.connect("mongodb://"+ config.DB_HOST +":"+config.DB_PORT, (err, client) => {
  // Client returned
  var db = client.db(config.DB_NAME);
  db.collection('userAdmin').drop()
  db.collection('userAdmin').insertOne({
    firstName: 'Fayn',
    lastName: 'Fayn',
    email: 'admin@fayn.com',
    userName : 'fayn',
    password: crypt('password'),
    role: 'ROOT',
    status: 'ACTIVE',
    createdAt: new Date,
    updatedAt: new Date
  })

  client.close()
});


function crypt(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
