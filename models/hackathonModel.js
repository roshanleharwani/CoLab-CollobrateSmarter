const mongoose = require('mongoose')


const hackathonSchema = new mongoose.Schema({
  tile: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required:true
  },
  club:{
    type:String,
    required:true
  },
  teamName :{
    type:String,
    required:true,
  },
  existingMembers:{
    type:Array,
    
  },
  skillsRequired:{
    type:Array,
    required:true
  },
  eventType:{
    type:String,
    required:true
  }
  
});


module.exports = mongoose.model('hackathonPost', hackathonSchema);
