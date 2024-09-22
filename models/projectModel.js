const mongoose = require('mongoose')


const projectSchema = new mongoose.Schema({
  userName:{
    type:String,
    required:true
  },
  projectName: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: true
  },
  numberOfMembersRequired: {
    type: Number,
    required:true
  },
  existingMembers:{
    type:Array,
  },
  skillsRequired :{
    type:Array,
    required:true
  },
  color:{
    type:String,
    required:true
  }
  
});


module.exports = mongoose.model('projectPost', projectSchema);
