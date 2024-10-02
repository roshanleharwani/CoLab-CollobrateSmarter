const mongoose = require("mongoose");
const initData = require("./data.js"); // Array of objects
const TeamProject = require("../models/teamProject.js"); // Mongoose model for the collection
const { v4: uuidv4 } = require('uuid');

main().then(() => {
  console.log("Connected to database");
  initDb(); 
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/COLAB', {
    
  });
}

const initDb = async () => {
    await TeamProject.deleteMany({});
  // try {
  //   // Insert the data from initData into the TeamProject collection
  //   await TeamProject.insertMany(initData);
  //   console.log("Data inserted successfully!");
  // } catch (error) {
  //   console.log("Error inserting data:", error);
  //   console.log(uuidv4())
  // } finally {
  //   mongoose.connection.close(); // Close the connection after inserting the data
  // }
};


