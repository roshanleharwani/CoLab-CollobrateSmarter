const mongoose = require("mongoose");
const initData = require("./data.js"); // Array of objects
const TeamProject = require("../models/teamProject.js"); // Mongoose model for the collection

main().then(() => {
  console.log("Connected to database");
  initDb(); // Initialize the database after connection
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/colab', {
    
  });
}

const initDb = async () => {
    await TeamProject.deleteMany({});
  try {
    // Insert the data from initData into the TeamProject collection
    await TeamProject.insertMany(initData);
    console.log("Data inserted successfully!");
  } catch (error) {
    console.log("Error inserting data:", error);
  } finally {
    mongoose.connection.close(); // Close the connection after inserting the data
  }
};
