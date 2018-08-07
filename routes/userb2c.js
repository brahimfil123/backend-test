const express = require('express');
const router = express.Router();
const DB_HELPER = require('../util/dataBase')

const {
    login, 
    signUp, 
    getAllUsersAdmin, 
    deleteUsersAdmin, 
    getUsersAdmin, 
    updateUsersAdmin
} = require("../controllers/B2C/admin.controller");

const {
    getAllEvents,
    publishEvent,
    addEventToFavs,
    interestedInEvent
} = require("../controllers/b2c/event.controller");

const { verifyToken, validateToken } = require("../util/auth");

router.get('/user',(req, res)=> {
    res.json('userb2c')
})

router.post('/login', login);
router.post('/signUp', signUp);
router.get('/getUserInfo/:id', getUsersAdmin);
router.get('/getUserByToken', verifyToken, getUsersAdmin );
router.post('/verifyToken', verifyToken, validateToken);

router.put('/addEventToFavs/:id', verifyToken, addEventToFavs );
router.put('/interestedInEvent/:id', verifyToken, interestedInEvent );
router.get('/getAllEvents', verifyToken, getAllEvents );


module.exports =  router;
