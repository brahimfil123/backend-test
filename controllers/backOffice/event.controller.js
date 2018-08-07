const bcrypt = require('bcrypt-node')
const Events = require('../../models/events')
const Categories = require('../../models/categories')
const Cities = require('../../models/cities')
const UserB2B = require('../../models/userB2B')

const errorsMsg = require('../../util/constError')
const {httpErrors, crypt, httpSuccess, cryptTokenData} = require('../../util/util')

module.exports = {
    
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent,
    publishEvent,
    uploadEventImage
}

function uploadEventImage(req, res){
    console.log(req.file)
    res.status(200).send(req.file.filename);
}

function createEvent(req, res){
    req.checkBody('organisation',errorsMsg.COMPANYNAME).notEmpty();
    req.checkBody('city',errorsMsg.FIRSTNAME).notEmpty();
    req.checkBody('endDate',errorsMsg.FIRSTNAME).notEmpty();
    req.checkBody('category', errorsMsg.LASTNAME).notEmpty();
    req.checkBody('startDate',errorsMsg.EMAIL).notEmpty();
    req.checkBody('access', errorsMsg.USERNAME).notEmpty();
    req.checkBody('coordinates',errorsMsg.PASSWORD).notEmpty();
    req.checkBody('name', errorsMsg.ROLE).notEmpty();
    req.checkBody('image', errorsMsg.ROLE).notEmpty();
    req.checkBody('type', errorsMsg.CATEGORY).notEmpty();
    req.checkBody('description', errorsMsg.ADDRESS).notEmpty();
    req.getValidationResult()
        .then(errors =>{
            if(errors.isEmpty()) {
                
                UserB2B.findOne({companyName: req.body.organisation, role: 'ADMIN'})
                    .then(user => {
                        if(user) {
                            Categories.findOne({'name': req.body.category})
                            .then(category => {
                                //if(category) {
                                    Cities.findOne({'name': req.body.city})
                                    .then(city => {
                                        if(city) {
                                            let event = new Events({
                                                city : city._id,
                                                category: req.body.category,
                                                startDate: req.body.startDate,
                                                endDate: req.body.endDate,
                                                coordinates :  req.body.coordinates,
                                                name: req.body.name,
                                                access : req.body.access,
                                                type : req.body.type,
                                                organisation: user._id,
                                                description: req.body.description
                                            });
                                            if(req.body.publish)
                                            event.status = 'PUBLISHED';
                                            event.images.push(req.body.image)
                                            event.save()
                                                .then(data => httpSuccess(res, 200, data))
                                                .catch(err => httpErrors(res, 500, err))
                                        }
                                        else {
                                            let city = new Cities({  
                                                name: req.body.city,
                                            });
                                            city.save()
                                                .then(data => {
                                                    let event = new Events({
                                                        city : city._id,
                                                        category: req.body.category,
                                                        startDate: req.body.startDate,
                                                        endDate: req.body.endDate,
                                                        coordinates :  req.body.coordinates,
                                                        name: req.body.name,
                                                        organisation: user._id,
                                                        access : req.body.access,
                                                        description: req.body.description
                                                    });
                                                    if(req.body.publish)
                                                    event.status = 'PUBLISHED';
                                                    event.images.push(req.body.image)
                                                    event.save()
                                                        .then(data => httpSuccess(res, 200, data))
                                                        .catch(err => httpErrors(res, 500, err))
                                                })
                                                .catch(err => httpErrors(res, 500, err))
                                            //httpErrors(res, 409, errorsMsg.ID_NOT_FOUND)
                                        }
                                    })
                                    .catch(err => httpErrors(res, 500, err))
                                /*}
                                else {
                                    httpErrors(res, 409, errorsMsg.ID_NOT_FOUND)
                                }*/
                            })
                            .catch(err => httpErrors(res, 500, err))
                            
                        }
                        else {
                            httpErrors(res, 409, errorsMsg.ID_NOT_FOUND)
                        }
                })
                .catch(err => httpErrors(res, 500, err))
            }
            else
                httpErrors(res, 404, errors.array())
        }).catch(err => httpErrors(res, 500, err))
}

function getAllEvents(req, res){
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


                if(req.query.organisation) {
                    
                    /*const filter1 = {};
                    filter1['companyName'] = {$regex : '^'+req.query.organisation };
                    filter1['role'] = 'ADMIN';
                    filter['organisation'] = UserB2B.find(filter1)
                            .then(function(orgs){
                                console.log(orgs);
                                return ({ '$in' : [orgs[0]._id] })
                            });*/
                    filter['organisation'] = { '$in' : []}

                }
                const filter1 = {};
                filter1['companyName'] = {$regex : (req.query.organisation ? '^'+req.query.organisation :'^.') };
                filter1['role'] = 'ADMIN';
                console.log(filter1)
                UserB2B.find(filter1,'_id')
                        /*.toArray()*/
                        
                        .then(function(orgs){
                            
                        console.log(orgs.map(function(ele) {return ele._id} ))
                            filter['organisation'] = { '$in' : orgs.length>0?orgs.map(function(ele) {return ele._id} ):[]};
                            filter['parent'] = { $exists : false };
                            console.log(filter)

                            return  Promise.all([
                                        Events
                                            .find(filter)
                                            .populate('city organisation')
                                            .populate({path : 'children', populate : {path : 'city organisation'}})
                                            .skip((currentPage - 1) * itemsPerPage)
                                            .limit(itemsPerPage)
                                            .sort(order)
                                            .then(data => data),
                                        Events
                                            .find(filter)
                                            .count(total => total )
                                    ])
                                        .then(result => httpSuccess(res, 200, {events : result[0], total : result[1]}))
                                        .catch(err => httcheckPpErrors(res, 500, errorsMsg.SERVER_ERROR))
                                })
            }
            else
                httpErrors(res, 404, errors.array())
        }).catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
}

function deleteEvent(req, res, next){
    req.checkParams('id',errorsMsg.ID_NOT_FOUND).notEmpty();
    req.getValidationResult()
        .then(errors =>{
            if(errors.isEmpty())
            {
                    Events.findById(req.params.id).then(event =>{
                        if(event){
                            //console.log(event) 
                            event.status = 'ARCHIVED';
                            event.save()
                                .then(result =>
                                    httpSuccess(res, 200, result)
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

function publishEvent(req, res, next){
    req.checkParams('id',errorsMsg.ID_NOT_FOUND).notEmpty();
    req.getValidationResult()
        .then(errors =>{
            if(errors.isEmpty())
            {
                    Events.findById(req.params.id).then(event =>{
                        if(event){
                            event.status = 'PUBLISHED';   
                            event.save()
                                .then(result =>
                                    httpSuccess(res, 200, result)
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

function updateEvent(req, res) {
    
        req.checkBody('id',errorsMsg.ID_NOT_FOUND).notEmpty();

        if(req.body.name)
            req.checkBody('name',errorsMsg.ROLE).notEmpty();

        if(req.body.startDate)
            req.checkBody('startDate',errorsMsg.FIRSTNAME).notEmpty();

        if(req.body.endDate)
            req.checkBody('endDate',errorsMsg.LASTNAME).notEmpty();

        if(req.body.description)
            req.checkBody('description',errorsMsg.EMAIL).notEmpty();

        if(req.body.parent)
            req.checkBody('parent',errorsMsg.USERNAME).notEmpty();

        if(req.body.access)
            req.checkBody('access',errorsMsg.EMAIL).notEmpty();

        if(req.body.type)
            req.checkBody('type',errorsMsg.EMAIL).notEmpty();

        if(req.body.city)
            req.checkBody('city',errorsMsg.EMAIL).notEmpty();

       if(req.body.coordinates)
            req.checkBody('coordinates',errorsMsg.EMAIL).notEmpty();

        if(req.body.category)
            req.checkBody('category',errorsMsg.EMAIL).notEmpty();

        if(req.body.organisation)
            req.checkBody('organisation',errorsMsg.EMAIL).notEmpty();

        req.getValidationResult()
            .then(errors => {
                if(errors.isEmpty()) {
                    Events.findOne({_id :req.body.id})
                        .then(event => {
                            console.log("here");
                            if(event){

                                Categories.findOne({'name': req.body.category})
                                .then(category => {
                                    //if(category) {
                                    Cities.findOne({'name': req.body.city})
                                    .then(city => {
                                        if(city) {
                                            if(req.body.parent) {
                                                const newEvent = new Events({
                                                    city : city._id,
                                                    category: category || req.body.category,
                                                    startDate: req.body.startDate,
                                                    endDate: req.body.endDate,
                                                    coordinates :  req.body.coordinates || [1, 2],
                                                    name: req.body.name,
                                                    organisation: event.organisation,
                                                    parent : event._id,
                                                    access : req.body.access,
                                                    description: req.body.description
                                                });

                                                newEvent.save()
                                                    .then(data => {
                                                        event.children.push(data._id);
                                                        event.save()
                                                        .then(data1 => httpSuccess(res, 200, data))
                                                    })
                                                    .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                                            }
                                            else {
                                                event.city = city._id;
                                                event.category = category || req.body.category;
                                                event.startDate = req.body.startDate;
                                                event.endDate= req.body.endDate;
                                                event.coordinates = req.body.coordinates || [1, 2];
                                                event.name = req.body.name;
                                                event.access = req.body.access;
                                                event.description = req.body.description;

                                                event.save()
                                                    .then(data => {
                                                        console.log(data.type === 'CHAPEAU')
                                                        if(data.children.length > 0 && data.type === 'CHAPEAU'){
                                                            const child = {};
                                                            child.category = data.category;
                                                            child.name = data.name;
                                                            child.access = data.access;
                                                            child.description = data.description;
                                                            
                                                
                                                            Events.update({_id:{ $in: data.children}}, child, { multi: true })
                                                                .then(function(){
                                                                    httpSuccess(res, 200, data)
                                                                })
                                                        }
                                                        else
                                                        httpSuccess(res, 200, data);
                                                    })
                                                    .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                                            
                                            }
                                        }
                                        else {
                                            let city = new Cities({  
                                                name: req.body.city,
                                            });
                                            city.save()
                                                .then(data => {
                                                    if(req.body.parent){
                                                    const newEvent = new Events({
                                                        city : data._id,
                                                        category: category || req.body.category,
                                                        startDate: req.body.startDate,
                                                        endDate: req.body.endDate,
                                                        coordinates :  req.body.coordinates || [1, 2],
                                                        name: req.body.name,
                                                        organisation: event.organisation,
                                                        parent : event._id,
                                                        access : req.body.access,
                                                        description: req.body.description
                                                    });

                                                    newEvent.save()
                                                        .then(data => {
                                                            event.children.push(data._id);
                                                            event.save()
                                                            .then(data1 => httpSuccess(res, 200, data))
                                                        })
                                                        .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                                                    }
                                                    else {
                                                        event.city = data._id,
                                                        event.category = category || req.body.category,
                                                        event.startDate = req.body.startDate,
                                                        event.endDate= req.body.endDate,
                                                        event.coordinates = req.body.coordinates || [1, 2],
                                                        event.name = req.body.name,
                                                        event.access = req.body.access,
                                                        event.description = req.body.description

                                                        event.save()
                                                            .then(data => {
                                                                if(data.children.length > 0 && data.type === 'CHAPEAU'){
                                                                    const child = {};
                                                                    child.category = data.category;
                                                                    child.name = data.name;
                                                                    child.access = data.access;
                                                                    child.description = data.description;
                                                                    
                                                        
                                                                    Events.update({_id:{ $in: data.children}}, child, { multi: true })
                                                                        .then(function(){
                                                                            httpSuccess(res, 200, data)
                                                                        })
                                                                }
                                                                else
                                                                httpSuccess(res, 200, data);
                                                            })
                                                            .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                                            
                                                    }
                                                })            
                                                .catch(err => httpErrors(res, 500, errorsMsg.SERVER_ERROR))
                                            //httpErrors(res, 409, errorsMsg.ID_NOT_FOUND)
                                        }
                                        })
                                        .catch(err => httpErrors(res, 500, err))
                                    /*}
                                    else {
                                        httpErrors(res, 409, errorsMsg.ID_NOT_FOUND)
                                    }*/
                                })
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