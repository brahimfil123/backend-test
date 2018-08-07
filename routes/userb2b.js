const express = require('express');
const router = express.Router();
const DB_HELPER = require('../util/dataBase')

router.get('/userb2b',(req, res)=> {
    res.json('userb2b')
})

module.exports =  router;
