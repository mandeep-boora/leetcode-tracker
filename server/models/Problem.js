const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true   // every problem belongs to a user
  },
  title: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],  // only these 3 values allowed
    required: true
  },
  topic: { type: String, required: true },  // e.g. "Arrays", "Trees"
  status: {
    type: String,
    enum: ['Solved', 'Attempted', 'Unsolved'],
    default: 'Unsolved'
  },
  timeTaken: { type: Number, default: 0 },   // in minutes
  attempts: { type: Number, default: 1 },
  notes: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Problem', problemSchema)