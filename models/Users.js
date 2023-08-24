const mongoose = require('mongoose')    // Import mongoose module for working with MongoDB
const Schema = mongoose.Schema          // Get the Schema class from mongoose

// Create a new Schema for user data
const userSchema = new Schema({
    username: { type: String, required: true },        // Define a required field "username" of type String
    password: { type: String, required: true }         // Define a required field "password" of type String
})

// Create a model named "users" using the userSchema
const userModel = mongoose.model("users", userSchema)

// Export the userModel to be used in other files
module.exports = userModel