const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const adminSchema = new Schema({
    firstName:{
        type:Schema.Types.String,
        required :false
    },
    lastName:{
        type:Schema.Types.String,
        required :false
    },
    userName:{
        type: Schema.Types.String,
        required : false,
        unique : true,
        dropDups: true
    },
    email :{
        type:Schema.Types.String,
        required:true,
        unique : true,
        dropDups: true
    },
    password :{
        type:Schema.Types.String,
        required:true
        },
    status :{
        type :Schema.Types.String,
        enum: ['ACTIVE', 'SUSPENDED'],
        required : true,
        default : 'ACTIVE'
    },
    role :{
        type :Schema.Types.String,
        enum: ['ADMIN', 'ROOT'],
        required : true,
        default : 'ADMIN'
    }

},
{
    timestamps:true
})

adminSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
}


module.exports = mongoose.model('userAdmin',adminSchema, 'userAdmin')