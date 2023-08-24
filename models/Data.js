const mongoose = require('mongoose')   // Import mongoose module for working with MongoDB
const Schema = mongoose.Schema         // Get the Schema class from mongoose

// Create a new Schema for your data
const dataSchema = new Schema({
    title: { type: String, required: true },     // Define a required field "title" of type String
    date: { type: Date, required: true },        // Define a required field "date" of type Date
    description: { type: String, required: true },       // Define a required field "description" of type String
    userOwner: {type: String, required: true }           // Define a required field "userOwner" of type String
})

// Create a model named "data" using the dataSchema
const dataModel = mongoose.model("data", dataSchema)
module.exports = dataModel        // Export the dataModel to be used in other files