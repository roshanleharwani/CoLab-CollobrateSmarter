const mongoose = require('mongoose');
const userModel = require('../models/userModel.js');
const teamProjectSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  membersRequired: { type: Number, required: true },
  members: { type: Array, default: [] }, // This defines 'members' as an array of strings
  requiredSkills:{type:Array,default:[]},
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel', 
  },
  imageIndex:{
    type:Number,
    required:true
  }

});

const TeamProject = mongoose.model('TeamProject', teamProjectSchema);
module.exports = TeamProject;
