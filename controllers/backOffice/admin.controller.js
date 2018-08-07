const bcrypt = require('bcrypt-node')
const userAdmin = require('../../models/userAdmin')
const errorsMsg = require('../../util/constError')
const {httpErrors, crypt, httpSuccess, cryptTokenData} = require('../../util/util')
const Auth = require("../../util/auth")

module.exports = {
    login,
    createAdmin,
    getAllUsersAdmin,
    deleteUsersAdmin,
    getUsersAdmin,
    updateUsersAdmin
};

function login (req, res) {
    req.checkBody('userName',errorsMsg.INVALID_USERNAME).notEmpty();
    req.checkBody('password', errorsMsg.INVALID_PASSWORD).notEmpty();

    req.getValidationResult()
        .then(function(errors) {
            if(errors.isEmpty()) {
                let email = req.body.userName;
                let userName = req.body.userName;

                userAdmin.findOne({
                    $or : [{userName}, {email}]
                })
                    .then(data => {
                        if(data) {
                            if (data.status === 'ACTIVE') {
                                if(bcrypt.compareSync(req.body.password, data.password)) {
                                    const token = Auth.createToken(cryptTokenData({id :data._id, role : data.role}, req.app.get("privateKey")), '10h', req.app.get("privateKey"));
                                    httpSuccess(res, 200, token)
                                }
                                else
                                    httpErrors(res, 404, errorsMsg.CREDENTIALS)
                            } else {
                                httpErrors(res, 409, errorsMsg.DISABLED_ACCOUNT)
                            }

                        }
                        else
                            httpErrors(res, 404, errorsMsg.CREDENTIALS)
                    })
                    .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
            }
            else
                httpErrors(res, 404, errors.array())
        })
}

function createAdmin(req, res){
    req.checkBody('firstName',errorsMsg.FIRSTNAME).notEmpty();
    req.checkBody('lastName', errorsMsg.LASTNAME).notEmpty();
    req.checkBody('email',errorsMsg.EMAIL).notEmpty();
    req.checkBody('userName', errorsMsg.USERNAME).notEmpty();
    req.checkBody('password',errorsMsg.PASSWORD).notEmpty();
    req.checkBody('role', errorsMsg.ROLE).notEmpty();
    req.getValidationResult()
        .then(errors => {
            if(errors.isEmpty()) {
                if(req.user.role !== 'ROOT'){
                    httpErrors(res, 403, errorsMsg.NOT_AUTH_ROLES);
                } else {
                    let email = req.body.email;
                    let userName = req.body.userName;

                    userAdmin.findOne({$or: [{userName}, {email}]})
                        .then(user => {
                            if (!user) {
                                let newUser = new userAdmin({
                                    firstName: req.body.firstName,
                                    lastName: req.body.lastName,
                                    email: req.body.email,
                                    userName: req.body.userName,
                                    password: crypt(req.body.password),
                                    role: req.body.role,
                                    status: req.body.status ? req.body.status : 'SUSPENDED'
                                });
                                newUser.save()
                                    .then(data => httpSuccess(res, 200, data))
                                    .catch(err => httpErrors(res, 500, err))
                            } else {
                                httpErrors(res, 409, errorsMsg.ALREADY_EXIST)
                            }
                        })
                        .catch(err => httpErrors(res, 500, err))
                }
            }
            else
                httpErrors(res, 404, errors.array())
        })
        .catch(err => httpErrors(res, 500, err))
}

function getAllUsersAdmin(req, res){
    req.checkQuery('current',errorsMsg.PAGE).isNumeric();
    req.checkQuery('pageSize', errorsMsg.ITEM_PER_PAGE).isNumeric();

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

                Promise.all([
                    userAdmin
                        .find(filter)
                        .skip((currentPage - 1) * itemsPerPage)
                        .limit(itemsPerPage)
                        .sort(order)
                        .then(data => data),
                    userAdmin
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

function deleteUsersAdmin(req, res, next) {
    if(req.user.role !== 'ROOT')
        httpErrors(res, 403, errorsMsg.NOT_AUTH_ROLES);
    else {
        req.checkParams('id', errorsMsg.ID_NOT_FOUND).notEmpty();
        req.getValidationResult()
            .then(errors => {
                if (errors.isEmpty()) {
                    userAdmin.findOne({_id: req.params.id})
                        .then(user => {
                        if (user.role !== undefined) {
                            if (user.role === 'ROOT' && req.user.role !== 'ROOT')
                                httpErrors(res, 403, errorsMsg.NOT_AUTH_ROLES);
                            else {
                                userAdmin.update(
                                    {_id: req.params.id},
                                    {status: 'SUSPENDED'}
                                )
                                    .then(result => httpSuccess(res, 200, {}))
                                    .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                            }
                        }
                        else
                            httpErrors(res, 404, errorsMsg.USER_NOT_FOUND)
                    }).catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                }
                else
                    httpErrors(res, 404, errors.array())
            })
            .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
    }
}

function updateUsersAdmin(req, res) {
    if(req.user.role !== 'ROOT')
        httpErrors(res, 403, errorsMsg.NOT_AUTH_ROLES);
    else {
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
                    userAdmin.findOne({_id :req.body.id})
                        .then(user => {
                            if(user.role !== undefined) {
                                if(user.role === 'ROOT' && req.user.role !== "ROOT")
                                    httpErrors(res, 403, errorsMsg.NOT_AUTH_ROLES);
                                else {
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
}

function getUsersAdmin (req, res){
    userAdmin.findById(req.user.id)
        .then(data => {
            if(data)
                httpSuccess(res, 200, data);
            else
                httpErrors(res, 404, errorsMsg.USER_NOT_FOUND)
        })
        .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
}