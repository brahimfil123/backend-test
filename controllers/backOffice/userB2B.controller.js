const bcrypt = require('bcrypt-node')
const UserB2B = require('../../models/userB2B')
const errorsMsg = require('../../util/constError')
const {httpErrors, crypt, httpSuccess, cryptTokenData} = require('../../util/util')
const Auth = require("../../util/auth")

module.exports = {
    
    createUserB2B,
    deleteUserB2B,
    activateUserB2BAccount,
    getAllUsersB2B,
    updateUserB2B,
    getAllEstablishments
}

function createUserB2B(req, res){
    req.checkBody('companyName',errorsMsg.COMPANYNAME).notEmpty();
    req.checkBody('firstName',errorsMsg.FIRSTNAME).notEmpty();
    req.checkBody('lastName', errorsMsg.LASTNAME).notEmpty();
    req.checkBody('email',errorsMsg.EMAIL).notEmpty();
    req.checkBody('userName', errorsMsg.USERNAME).notEmpty();
    req.checkBody('password',errorsMsg.PASSWORD).notEmpty();
    req.checkBody('role', errorsMsg.ROLE).notEmpty();
    //req.checkBody('category', errorsMsg.CATEGORY).notEmpty();
    req.checkBody('address', errorsMsg.ADDRESS).notEmpty();
    req.checkBody('country', errorsMsg.COUNTRY).notEmpty();
    req.checkBody('city', errorsMsg.CITY).notEmpty();
    req.checkBody('phone', errorsMsg.PHONE).notEmpty();
    req.checkBody('mobile', errorsMsg.MOBILE).notEmpty();
    req.getValidationResult()
        .then(errors =>{
            if(errors.isEmpty()) {
                let email = req.body.email;
                let userName = req.body.userName;
                console.log(email);
                /*userB2B.findOne({$or: [{userName}, {email}]})
                    .then(user => {
                        console.log("1");
                        if (!user) {*/
                            let userB2B = new UserB2B({
                                companyName : req.body.companyName,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                email: req.body.email,
                                userName :  req.body.userName,
                                address : {
                                    address : req.body.address,
                                    country : req.body.country,
                                    city: req.body.city
                                },
                                password: crypt(req.body.password),
                                //category: req.body.category,
                                phone: req.body.phone,
                                mobile: req.body.mobile,
                                role: req.body.role,
                                status: req.body.status ? req.body.status : 'ACTIVE'
                            });
                            /*if(req.body.links && Array.isArray(req.body.links)){
                                let links = [];
                                links = req.body.links.filter(link => {
                                    return link.link && link.linkType
                                });
                                userB2B.links = links;
                            }*/
                            if(req.body.category) userB2B.category = req.body.category;
                            
                            userB2B.save()
                                .then(data => httpSuccess(res, 200, data))
                                .catch(err => httpErrors(res, 500, err))
                        /*}
                        else {
                            httpErrors(res, 409, errorsMsg.ALREADY_EXIST)
                        }
                })
                .catch(err => httpErrors(res, 500, err))*/
            }
            else
                httpErrors(res, 404, errors.array())
        }).catch(err => httpErrors(res, 500, err))
    }

    function getAllUsersB2B(req, res){
        console.log(req.query)
        req.checkQuery('current',errorsMsg.PAGE).isNumeric();
        req.checkQuery('pageSize', errorsMsg.ITEM_PER_PAGE).isNumeric();

        /*
            "field" : "firstName",
            "order" : "descend"
        */

        req.getValidationResult()
            .then(errors =>{
                if(errors.isEmpty()) {
                    let currentPage = parseInt(req.query.current);
                    let itemsPerPage = parseInt(req.query.pageSize);

                    let order = {};
                    let filter = {};

                    if(req.query.field) {
                        if(req.query.order === 'descend')
                            order[req.query.field] = -1;
                        if(req.query.order === 'ascend')
                            order[req.query.field] = 1
                    }

                    if(req.query.status) {
                        
                        let status = JSON.parse(req.query.status);
                        if(status.length > 0) {
                            filter['status'] = {
                                $in: [...status]
                            }
                        }
                    } 

                    if(req.query.role) {
                        
                        let role = JSON.parse(req.query.role);
                        if(role.length > 0) {
                            filter['role'] = {
                                $in: [...role]
                            }
                        }
                    }

                    if(req.query.companyName) {
                        
                            filter['companyName'] = req.query.companyName;
    
                    }
    
                    Promise.all([
                        UserB2B
                            .find(filter)
                            .skip((currentPage - 1) * itemsPerPage)
                            .limit(itemsPerPage)
                            .sort(order)
                            .then(data => data),
                        UserB2B
                            .find({})
                            .count(total => total )
                    ])
                        .then(result => httpSuccess(res, 200, {users : result[0], total : result[1]}))
                        .catch(err => httcheckPpErrors(res, 500, errorsMsg.SERVER_ERROR))
                }
                else
                    httpErrors(res, 404, errors.array())
            }).catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
    }

    function getAllEstablishments(req, res){
        req.getValidationResult()
            .then(errors =>{
                if(errors.isEmpty()) {
                    UserB2B
                        .distinct('companyName')
                        .then(result => httpSuccess(res, 200, result))
                        .catch(err => httcheckPpErrors(res, 500, errorsMsg.SERVER_ERROR))
                }
                else
                    httpErrors(res, 404, errors.array())
            }).catch(err => httpErrors(res, 500, err))
    }

    function deleteUserB2B(req, res, next){
        req.checkParams('id',errorsMsg.ID_NOT_FOUND).notEmpty();
        req.getValidationResult()
            .then(errors =>{
                if(errors.isEmpty())
                {
                        UserB2B.findById(req.params.id).then(user =>{
                            if(user){
                                user.status = 'ARCHIVE'.   
                                user.save()
                                    .then(result =>
                                        httpSuccess(res, 200, {})
                                    )
                                    .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                            }
                            else
                                httpErrors(res, 404, errorsMsg.USER_NOT_FOUND)
                        }).catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                }
                else
                    httpErrors(res, 404, errors.array())
            }).catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
    }

    function updateUserB2B(req, res) {
        
            req.checkBody('id',errorsMsg.ID_NOT_FOUND).notEmpty();
    
            if(req.body.role)
                req.checkBody('role',errorsMsg.ROLE).notEmpty();
    
            if(req.body.firstName)
                req.checkBody('firstName',errorsMsg.FIRSTNAME).notEmpty();
    
            if(req.body.lastName)
                req.checkBody('lastName',errorsMsg.LASTNAME).notEmpty();
    
            if(req.body.email)
                req.checkBody('email',errorsMsg.EMAIL).notEmpty();
    
            if(req.body.userName)
                req.checkBody('userName',errorsMsg.USERNAME).notEmpty();
    
            if(req.body.password)
                req.checkBody('password',errorsMsg.PASSWORD).notEmpty();
    
            if(req.body.status)
                req.checkBody('status',errorsMsg.STATUS).notEmpty();
            req.getValidationResult()
                .then(errors => {
                    if(errors.isEmpty()) {
                        UserB2B.findOne({_id :req.body.id})
                            .then(user => {
                                if(user.role !== undefined) {
                                    if(req.body.role)
                                        user.role = req.body.role;

                                    if(req.body.firstName)
                                        user.firstName = req.body.firstName;

                                    if(req.body.lastName)
                                        user.lastName = req.body.lastName;

                                    if(req.body.email)
                                        user.email = req.body.email;

                                    if(req.body.userName)
                                        user.userName = req.body.userName;

                                    if(req.body.password)
                                        user.password = crypt(req.body.password);

                                    if(req.body.status)
                                        user.status = req.body.status;

                                    user.save()
                                        .then(data => httpSuccess(res, 200, data))
                                        .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                                }
                                else
                                    httpErrors(res, 404, errorsMsg.USER_NOT_FOUND)
                            })
                            .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                    }
                    else
                        httpErrors(res, 404, errors.array())
                })
                .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
    }

    function activateUserB2BAccount(req, res, next){
        req.checkParams('id',errorsMsg.ID_NOT_FOUND).notEmpty();
        req.getValidationResult()
            .then(errors =>{
                if(errors.isEmpty())
                {
                        UserB2B.findOne({_id :req.params.id}).
                        then(user =>{
                            if(user.role !== undefined && user.status !== 'ACTIVE'){   
                                user.status = 'ACTIVE';
                                user.save()
                                    .then(data =>{
                                        httpSuccess(res, 200, data)
                                    })
                                    .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                            }
                            else
                                httpErrors(res, 404, errorsMsg.USER_NOT_FOUND)
                        }).catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                }
                else
                    httpErrors(res, 404, errors.array())
            }).catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
    }