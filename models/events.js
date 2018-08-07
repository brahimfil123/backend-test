const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;
let eventSchema = new Schema({
  city : {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'cities'
  },
  category : {
    type: String,
    required: true
  },
  type : {
    type: String,
    required: true,
    enum : ['UNITAIRE', 'MULTIPLE', 'CHAPEAU'],
    default : 'UNITAIRE'
  },
  status : {
    type: String,
    required: true,
    enum : ['SAVED', 'PUBLISHED', 'ARCHIVED'],
    default : 'SAVED'
  },
  access : {
    type: String,
    required: true,
    enum : ['gratuit', 'payant'],
    default : 'gratuit'
  },
  parent : {
    type: Schema.Types.ObjectId,
    ref: 'event'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'event'
}],
  /*category : {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'categories'
  },*/
  favorites :[{
    type:Schema.Types.ObjectId,
    required :false,
    ref:"userB2C"
  }]
  ,
  startDate :{
    type : Schema.Types.Date,
    required: true
  },
  endDate :{
    type : Schema.Types.Date,
    required: true
  },
  coordinates :{
        index: '2dsphere',
        type: [Number],
        required: true
  },
  name :{
        type : Schema.Types.String,
        required : true
  },
  organisation :{
    type : Schema.Types.ObjectId,
    required : true,
    ref :"userB2B"
  },
  interested :[{
    type : Schema.Types.ObjectId,
    required : false,
    ref : 'userB2C'
  }],
  comments : [{
      type : Schema.Types.ObjectId,
      required : false,
      ref:'typeComment'
  }],
  images :[{
    type : Schema.Types.String,
    required : false
  }],
  description : {
    type: Schema.Types.String,
    required : false
  },
  users : [{
    users :{
        type : Schema.Types.ObjectId,
        required : true,
        ref : 'userB2C'
    },
    comment : {
        type : Schema.Types.ObjectId,
        required : false,
        ref : 'comment'
    }
}]
}, {
    timestamps: true
  });

  eventSchema.methods.toJSON = function() {
  var obj = this.toObject();
  obj.startDate = moment(obj.startDate).format('YYYY-MM-DD HH:mm:ss');
  obj.endDate = moment(obj.endDate).format('YYYY-MM-DD HH:mm:ss');
  return obj;
}

module.exports =  mongoose.model('event', eventSchema);
