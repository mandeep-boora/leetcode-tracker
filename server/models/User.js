const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true   // no two users with same email
  },
  password: {
    type: String,
    required: true  // we'll store this hashed, never plain text
  }
}, { timestamps: true })  // auto adds createdAt and updatedAt

module.exports = mongoose.model('User', userSchema)