const mongoose = require('mongoose');

const Schema = mongoose.Schema
const userB2BSchema = new Schema({
    companyName:{
        type:Schema.Types.String,
        required :false
    },
    lastName:{
        type:Schema.Types.String,
        required :false
    },
    firstName:{
        type:Schema.Types.String,
        required :false
    },
    userName:{
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
    category :{
        type : Schema.Types.ObjectId,
        required : false
    },
    address : {
        address : {
            type:Schema.Types.String,
            required : true
        },
        country : {
            type:Schema.Types.String,
            required : true
        },
        city : {
            type:Schema.Types.String,
            required : true
        }
    },
    phone : {
        type : Schema.Types.String,
        required : true
    },
    mobile : {
        type : Schema.Types.String,
        required : true
    },
    links : [
        {
            link : {
                type : Schema.Types.String,
                required : true
               
            },
            linkType : {
                type : Schema.Types.String,
                required : true,
                enum: ['FACEBOOK','GOOGLEPLUS','TWITTER','YOUTUBE','LINKDIN','INSTAGRAM','PINTEREST','OTHER'],
                default : 'OTHER'
            }
        }
    ],
    status :{
        type :Schema.Types.String,
        enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVE'],
        required : true,
        default : 'SUSPENDED'
    },
    role :{
        type :Schema.Types.String,
        enum: ['ADMIN', 'USER'],
        required : true,
        default : 'USER'
    }
},
{
    timestamps :true
})

userB2BSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }

module.exports = mongoose.model('userB2B', userB2BSchema, 'userB2B')

// To Do 
// Salle