const express = require('express')
const router = express.Router()
const protect = require('../middleware/protect')
const Problem = require('../models/Problem')

// All routes here require login — protect middleware runs first
router.use(protect)

// ADD a problem — POST /api/problems
router.post('/', async (req, res) => {
  const { title, difficulty, topic, status, timeTaken, attempts, notes } = req.body
  try {
    const problem = await Problem.create({
      userId: req.user.id,  // comes from the JWT token
      title, difficulty, topic, status, timeTaken, attempts, notes
    })
    res.status(201).json(problem)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET all problems for logged-in user — GET /api/problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(problems)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE a problem — DELETE /api/problems/:id
router.delete('/:id', async (req, res) => {
  try {
    await Problem.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ANALYTICS — GET /api/problems/analytics
router.get('/analytics', async (req, res) => {
  try {
    const problems = await Problem.find({ userId: req.user.id })

    // Count by topic
    const topicMap = {}
    problems.forEach(p => {
      topicMap[p.topic] = (topicMap[p.topic] || 0) + 1
    })

    // Count by difficulty
    const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 }
    problems.forEach(p => {
      difficultyCount[p.difficulty]++
    })

    // Simple recommendation: find weakest topic (fewest solved)
    const solvedByTopic = {}
    problems.filter(p => p.status === 'Solved').forEach(p => {
      solvedByTopic[p.topic] = (solvedByTopic[p.topic] || 0) + 1
    })
    const weakestTopic = Object.entries(solvedByTopic).sort((a, b) => a[1] - b[1])[0]

    res.json({
      topicMap,
      difficultyCount,
      totalSolved: problems.filter(p => p.status === 'Solved').length,
      totalProblems: problems.length,
      recommendation: weakestTopic ? `Practice more ${weakestTopic[0]} problems` : 'Keep going!'
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router