const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const usersRouter = require('./routes/users').router
const dataRouter = require('./routes/data')

// Import dotenv module to load environment variables
require('dotenv').config()    // Load environment variables from .env file

const PORT = process.env.PORT || 5000;
const app = express()

app.use(express.json())
app.use(cors())

app.use('/users', usersRouter)     // Set up users routes
app.use('/data', dataRouter)       // Set up data routes

// Connecting to mongodb database
const uri = process.env.ATLAS_URI       // Get MongoDB URI(Uniform Resource Identifier) from environment variables
mongoose.connect( uri,
    {
        useNewUrlParser: true,                 
        useUnifiedTopology: true,              
        writeConcern: {
            w: 'majority',
            j: true,
            wtimeoutMS: 1,
        }
    }
)

const connection = mongoose.connection
connection.once('open', () => {
    console.log("MongoDB database connection established succesfully")
})

app.listen(PORT, () => {          // Use 5000 as default port
    console.log("Server running on port 5000")
})