const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


const {
    login, 
    createAdmin, 
    getAllUsersAdmin, 
    deleteUsersAdmin, 
    getUsersAdmin, 
    updateUsersAdmin
} = require("../controllers/backOffice/admin.controller")

const {
    createUserB2B,
    deleteUserB2B,
    activateUserB2BAccount,
    getAllUsersB2B,
    updateUserB2B,
    getAllEstablishments
} = require("../controllers/backOffice/userB2B.controller");

const {
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent,
    publishEvent,
    uploadEventImage
} = require("../controllers/backOffice/event.controller");

const { verifyToken, validateToken } = require("../util/auth");

const storage = multer.diskStorage({
    destination: path.join(__dirname , '..', 'files'),
    filename(req, file, cb) {
        console.log(file)
      cb(null, `${new Date().getTime()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage })/*.any()*/;

  //let uploader = upload;


/*uploader = function(req, res, next) {
    upload(req, res, function (err) {
        if(err) {
            next(err);
        } else {
                next();
        } 
    })
};*/
  
  // express route where we receive files from the client
  // passing multer middleware

// ***************************** admin **************************
router.post('/createAdmin', verifyToken, createAdmin);
router.post('/verifyToken', verifyToken, validateToken);
router.post('/login', login);
router.get('/getAllUsersAdmin', verifyToken, getAllUsersAdmin );
router.get('/deleteUsersAdmin/:id', verifyToken, deleteUsersAdmin );
router.get('/getUserByToken', verifyToken, getUsersAdmin );
router.post('/updateUserAdmin', verifyToken, updateUsersAdmin );

// ************************** userB2B ****************************
router.post('/createUserB2B', verifyToken, createUserB2B );
router.put('/deleteUserB2B/:id', verifyToken, deleteUserB2B );
router.put('/activateUserB2BAccount/:id', verifyToken, activateUserB2BAccount );
router.get('/getAllUsersB2B', verifyToken, getAllUsersB2B );
router.get('/getAllEstablishments', verifyToken, getAllEstablishments );
router.post('/updateUserB2B', verifyToken, updateUserB2B );

// ************************** event ****************************
router.post('/createEvent', verifyToken, createEvent );
router.put('/deleteEvent/:id', verifyToken, deleteEvent );
router.put('/publishEvent/:id', verifyToken, publishEvent );
router.get('/getAllEvents', verifyToken, getAllEvents );
router.post('/updateEvent', verifyToken, updateEvent );
router.post('/uploadEventImage', upload.single('file'), uploadEventImage );


module.exports =  router;
