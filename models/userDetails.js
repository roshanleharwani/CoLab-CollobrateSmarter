const mongoose=require("mongoose");
const userModel = require('../models/userModel.js');
const userDetailsSchema=new mongoose.Schema({
    name:{type:String},
    phoneNumber:{type:Number},
    email:{type:String},
    regNumber:{type:Number},
    branch:{type:String},
    graduationYear:{type:Number},
    userId:{type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',}

})
const UserDetails=mongoose.model('UserDetails',userDetailsSchema);

module.exports=UserDetails;