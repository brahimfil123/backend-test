const bcrypt = require('bcrypt-node')
const Events = require('../../models/events')
const Categories = require('../../models/categories')
const Cities = require('../../models/cities')
const UserB2B = require('../../models/userB2B')
const _ = require('lodash');
const mongoose = require('mongoose');

const errorsMsg = require('../../util/constError')
const {httpErrors, crypt, httpSuccess, cryptTokenData} = require('../../util/util')

module.exports = {
    
    getAllEvents,
    publishEvent,
    addEventToFavs,
    interestedInEvent
}

function getAllEvents(req, res){
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
        
                //filter['status'] = 'PUBLISHED'
                     


                if(req.query.organisation) {
                    filter['organisation'] = { '$in' : []}
                }
                const filter1 = {};
                filter1['companyName'] = {$regex : (req.query.organisation ? '^'+req.query.organisation :'^.') };
                filter1['role'] = 'ADMIN';
                //console.log(filter1)
                UserB2B.find(filter1,'_id')
                        /*.toArray()*/
                        
                        .then(function(orgs){
                            
                        //console.log(orgs.map(function(ele) {return ele._id} ))
                            filter['organisation'] = { '$in' : orgs.length>0?orgs.map(function(ele) {return ele._id} ):[]};
                            filter['parent'] = { $exists : false };
                            //console.log(filter)

                            return  Promise.all([
                                        Events
                                            .find(filter, { status: 0 })
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
                                        .then(result => {
                                            var events =_.map(result[0],(event) => {
                                                var id = mongoose.Types.ObjectId(req.user.id)
                                                var exist = false;
                                                var exist1 = false;
                                                event.favorites.forEach(element => {
                                                    if(element.equals(id)){
                                                        exist = true;
                                                    }
                                                });
                                                event.interested.forEach(element => {
                                                    if(element.equals(id)){
                                                        exist1 = true;
                                                    }
                                                });
                                                //console.log(event)
                                                event.isInterested = exist1;
                                                event.isFavorite = exist;
                                                return event;

                                            })
                                            //console.log(result[0])
                                            console.log(events)
                                            httpSuccess(res, 200, {events, total : result[1]})
                                        })
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

function addEventToFavs(req, res, next){
    console.log(req.user);
    req.checkParams('id',errorsMsg.ID_NOT_FOUND).notEmpty();
    req.getValidationResult()
        .then(errors =>{
            if(errors.isEmpty())
            {
                    Events.findById(req.params.id).then(event =>{
                        if(event){
                            var id = mongoose.Types.ObjectId(req.user.id)
                            var exist = false;
                            event.favorites.forEach(element => {
                                if(element.equals(id)){
                                    exist = true;
                                }
                            });
                            if(exist) {
                              event.favorites =  _.filter(event.favorites, (element) => !element.equals(id));
                              console.log(event.favorites)
                            }
                            else {
                                event.favorites.push(req.user.id);
                            }                              
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

function interestedInEvent(req, res, next){
    console.log(req.user);
    req.checkParams('id',errorsMsg.ID_NOT_FOUND).notEmpty();
    req.getValidationResult()
        .then(errors =>{
            if(errors.isEmpty())
            {
                    Events.findById(req.params.id).then(event => {
                        if(event){
                            var id = mongoose.Types.ObjectId(req.user.id)
                            var exist = false;
                            event.interested.forEach(element => {
                                if(element.equals(id)){
                                    exist = true;
                                }
                            });
                            if(exist) {
                              event.interested =  _.filter(event.interested, (element) => !element.equals(id));
                              console.log(event.interested)
                            }
                            else {
                                event.interested.push(id);
                            }                              
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