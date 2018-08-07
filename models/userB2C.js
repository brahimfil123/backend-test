const mongoose = require('mongoose');

const Schema = mongoose.Schema
const userB2CSchema = new Schema({
    lastName:{
        type:Schema.Types.String,
        required :false
    },
    firstName:{
        type:Schema.Types.String,
        required :false
    },
    username:{
        type: Schema.Types.String,
        required : false
    },
    email :{
        type:Schema.Types.String,
        required:true
    },
    password :{
        type:Schema.Types.String,
        required:true
    },
    dob :{
        type: Schema.Types.String,
        required : true
    },
    phone : {
        type : Schema.Types.String,
        required : true
    },
    city : {
        type : Schema.Types.String,
        required : true
    },
    gender : {
        type :Schema.Types.String,
        enum: ['Male', 'Female'],
        required : true
    },
    status :{
        type :Schema.Types.String,
        enum: ['ACTIVE', 'SUSPENDED'],
        required : true,
        default : 'ACTIVE'
    },
    events : [{
        events :{
            type : Schema.Types.ObjectId,
            required : true,
            ref : 'event'
        },
        comment : {
            type : Schema.Types.ObjectId,
            required : false,
            ref : 'comment'
            
        }
    }]
})

module.exports = mongoose.model('userB2C',userB2CSchema, 'userB2C')
