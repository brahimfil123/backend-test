const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const citySchema = new Schema({
    name : {
        type : Schema.Types.String,
        required :true
    }
},
{
    timestamps :true
})

module.exports = mongoose.model('cities',citySchema)