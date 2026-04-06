const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware — lets our server read JSON and talk to React
app.use(cors())
app.use(express.json())

// Routes (we'll create these files next)
app.use('/api/auth', require('./routes/auth'))
app.use('/api/problems', require('./routes/problems'))

// Test route — visit this in browser to confirm server works
app.get('/', (req, res) => {
  res.send('Server is running!')
})

// Connect to MongoDB, then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => console.log('DB connection error:', err))