// Import necessary modules and models
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userModel = require('../models/Users')   // Import the User model

// Create a router instance
const router = express.Router()

// Route for user registration
router.route('/register').post(async (req, res) => {
    const { username, password } = req.body
    
    // Check if the username already exists
    const existingUser = await userModel.findOne({username})
    if(existingUser){
        return res.json({message: "Username already exist, try another username"})
    }

    // Hash the password
    const hashedPass = await bcrypt.hash(password, 10)

    // Create a new user with the hashed password
    const newUser = new userModel({
        username,
        password: hashedPass
    })

    // Save the new user to the database
    await newUser.save()
    res.json('Registration Successfull')
})

// Route for user login
router.route('/login').post(async (req, res) => {
    const { username, password } = req.body

    // Find the user by username
    const findUser = await userModel.findOne({ username })
    if(!findUser){
        return res.json({message1: "Username doesn't exist"})
    }

    // Compare the provided password with the hashed password in the database
    const passwordValidity = await bcrypt.compare(password, findUser.password)
    if(!passwordValidity){
        return res.json({message2: 'Invalid Password'})
    }

    // Create a JSON Web Token (JWT) for the user
    const token = await jwt.sign({ id: findUser._id }, "secret")

    // Respond with the token and user ID
    res.json({ token, userID: findUser._id })
})

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization

    // If token is present, decode it and extract user ID
    if(token) {
        const decodedToken = jwt.verify(token, "secret")
        const userId = decodedToken.id
        req.userID = userId       // Attach the user ID to the request object
        next()                    // Continue to the next middleware or route
    } else {
        res.sendStatus(401)       // Unauthorized if token is not present
    }
}

// Export the router and the verifyToken middleware
module.exports = { router, verifyToken}