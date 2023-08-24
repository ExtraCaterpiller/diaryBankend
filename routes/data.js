const express = require('express')                    // Import the express framework
const dataModel = require('../models/Data')           // Import the data model
const userModel = require('../models/Users')          // Import the user model
const mongoose = require('mongoose')                  // Import mongoose for working with MongoDB
const jwt = require('jsonwebtoken')                   // Import jsonwebtoken for handling JWTs
const router = express.Router()                       // Create an instance of the express router
const verifyToken = require('./users').verifyToken    // Import the verifyToken middleware
const axios = require('axios')                        // Import axios for making HTTP requests

require('dotenv').config()                 // Load environment variables from .env file
const apiKey = process.env.API_KEY         // Get the API key from environment variables

// Route to create new data
router.route('/create').post(verifyToken, async (req, res)  => {
    const { title, date, description } = req.body.updatedInput
    const userID = req.body.userID          // Get userID from the request body
    const useriD = req.userID               // Get userID from the request object

    // Check if the userIDs match
    if(userID == useriD){
        const user = await userModel.findById(useriD)

        if(!user) {
            return res.json('User not found')
        }

        // Create a new data entry using dataModel
        const newData = new dataModel({
            title,
            date,
            description,
            userOwner: useriD
        })

        // Save the new data entry
        const savedData = await newData.save()
        return res.json(savedData)
    } else {
        return res.json(useriD)
    }
})

// Route to get data based on month and year and also without month, year
router.route('/get').get(verifyToken, async (req, res) => {
    const page = parseInt(req.query.currentPage)
    const limit = parseInt(req.query.limit)
    const { month, year } = req.query                  // Get month and year from query parameters
    const userID = req.userID
    let filter = {userOwner: userID}                   // Initialize the filter object with userOwner field

    // Check if month and year are provided
    if(month !== undefined && year !== undefined){
        filter.date = {
            $gte: new Date(year, month - 1, 1),        // Filter data by start of the specified month
            $lt: new Date(year, month, 1)              // Filter data by start of the next month
        }
    }

    const totalDocuments = await dataModel.countDocuments(filter).exec()
    const endIndex = totalDocuments - (page - 1) * limit
    const startIndex = Math.max(endIndex - limit, 0)

    const results = {}
  
    if (startIndex > 0) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (endIndex < totalDocuments) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }

    results.totalPage = totalDocuments / limit

    try {
      results.results = await dataModel.find(filter).limit(limit).skip(startIndex).exec()
      res.paginatedResults = results
      res.json(res.paginatedResults)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }

    // Find data entries based on the filter
    /* const userData = await dataModel.find(filter) */
    /* res.json(userData) */
})

// Route to get a specific data entry by ID
router.route('/get/:id').get(verifyToken, async (req, res) => {
    const ID = req.params.id                     // Get the ID parameter from the request
    const userData = await dataModel.find({ _id: ID })         // Find the data entry by ID
    res.json(userData)
})

// Route to delete a specific data entry by ID
router.route('/delete/:id').delete(verifyToken, async (req, res) => {
    try {
        const id = req.params.id
        const deleteData = await dataModel.deleteOne({ _id: id })           // Delete the data entry by ID
        res.json("Deleted")
    } catch(err){
        res.json(err)
    }
})

// Route to retrieve data for editing by ID
router.route('/edit/:id').post(verifyToken, async (req, res) => {
    try{
        const id = req.params.id
        const data = await dataModel.findOne({ _id: id })           // Find the data entry by ID
        res.json(data)
    } catch(err){
        res.json(err)
    }
})

// Route to update data entry by ID
router.route('/update/:id').post(verifyToken, async (req, res) => {
    const id = req.params.id
    const updatedData = {
        title: req.body.title,
        date: req.body.date,
        description: req.body.description,
        userOwner: req.userID
    }

    // Find and update the data entry by ID
    dataModel.findByIdAndUpdate(id, updatedData, {new: true})
        .then(data => {
            if(!data){
                return res.json("Data not found")
            }
            res.json("Data updated")
        })
        .catch(err => res.status(400).json('Error ' + err))
})

// Route to fetch a quote using an external API
router.route('/api/quote').get(verifyToken, async (req, res) => {
    let currentQuote = ''
    const lastFetchTime = null

    async function fetchQuote(){
        const response = await axios.get('https://api.api-ninjas.com/v1/quotes?category=life', {headers: {'X-Api-Key': apiKey}})
        return response.data[0]
    }

    /* async function updateQuote(){
        if(!lastFetchTime || Date.now() - lastFetchTime >= 24 * 60 * 60 * 1000){
            currentQuote = await fetchQuote()
            lastFetchTime = Date.now()
        }
    } */
    currentQuote = await fetchQuote()
    
    res.json(currentQuote)
})


// Export the router to be used in other files
module.exports = router