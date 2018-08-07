const mongoose = require('mongoose');

const Schema = mongoose.Schema;
let typeCommentSchema = new Schema({
  comment : {
    type: Schema.Types.String,
    required: true
  }
}, {
    timestamps: true
  });



  module.exports = mongoose.model('typeComment', typeCommentSchema);