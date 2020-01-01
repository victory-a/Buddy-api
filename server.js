const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const connectDB = require('./config/db')

dotenv.config({path: './config/config.db'})

connectDB()

const app = express()

app.use(express.json())


if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

connectDB

const PORT = process.env.PORT || 4000

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)