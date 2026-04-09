const express = require('express')
const router = express.Router()
const protect = require('../middleware/protect')
const Problem = require('../models/Problem')

router.use(protect)

// ADD a problem — POST /api/problems
router.post('/', async (req, res) => {
  const { title, difficulty, topic, status, timeTaken, attempts, notes } = req.body
  try {
    const problem = await Problem.create({
      userId: req.user.id,
      title, difficulty, topic, status, timeTaken, attempts, notes
    })
    res.status(201).json(problem)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET all problems — GET /api/problems
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

    if (problems.length === 0) {
      return res.json({
        topicMap: {},
        difficultyCount: { Easy: 0, Medium: 0, Hard: 0 },
        totalSolved: 0,
        totalProblems: 0,
        recommendation: 'Log your first problem to get started!'
      })
    }

    // ── Topic map ────────────────────────────────────────────────
    const topicMap = {}
    problems.forEach(p => {
      topicMap[p.topic] = (topicMap[p.topic] || 0) + 1
    })

    // ── Difficulty count ─────────────────────────────────────────
    const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 }
    problems.forEach(p => { difficultyCount[p.difficulty]++ })

    const totalSolved   = problems.filter(p => p.status === 'Solved').length
    const totalAttempted = problems.filter(p => p.status === 'Attempted').length
    const totalProblems = problems.length

    // ── Per-topic solve rates ────────────────────────────────────
    // topicStats[topic] = { total, solved, attempted, totalTime, timedCount }
    const topicStats = {}
    problems.forEach(p => {
      if (!topicStats[p.topic]) {
        topicStats[p.topic] = { total: 0, solved: 0, attempted: 0, totalTime: 0, timedCount: 0 }
      }
      const t = topicStats[p.topic]
      t.total++
      if (p.status === 'Solved')    t.solved++
      if (p.status === 'Attempted') t.attempted++
      if (p.timeTaken && !isNaN(p.timeTaken)) {
        t.totalTime  += Number(p.timeTaken)
        t.timedCount++
      }
    })

    // ── Hard problems breakdown ──────────────────────────────────
    const hardProblems      = problems.filter(p => p.difficulty === 'Hard')
    const hardAttempted     = hardProblems.filter(p => p.status === 'Attempted').length
    const hardSolvedCount   = hardProblems.filter(p => p.status === 'Solved').length

    // ── Average solve time (all timed solved problems) ───────────
    const timedSolved = problems.filter(p => p.status === 'Solved' && p.timeTaken && !isNaN(p.timeTaken))
    const avgTime = timedSolved.length
      ? timedSolved.reduce((sum, p) => sum + Number(p.timeTaken), 0) / timedSolved.length
      : 0

    // ── Slow problems (took > 45 min) ────────────────────────────
    const slowProblems = problems.filter(p => p.timeTaken && Number(p.timeTaken) > 45)

    // ── Recent activity (last 5 problems) ────────────────────────
    const recent = [...problems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    const recentSolveRate = recent.filter(p => p.status === 'Solved').length / recent.length

    // ── Topics with weak solve rates (< 50% solved, min 2 attempts) ──
    const weakTopics = Object.entries(topicStats)
      .filter(([, s]) => s.total >= 2 && (s.solved / s.total) < 0.5)
      .sort((a, b) => (a[1].solved / a[1].total) - (b[1].solved / b[1].total))

    // ── Topics never attempted ───────────────────────────────────
    const unsolvedTopics = Object.entries(topicStats)
      .filter(([, s]) => s.solved === 0)
      .map(([topic]) => topic)

    // ── Streak: consecutive days logged ─────────────────────────
    const daySet = new Set(
      problems.map(p => new Date(p.createdAt).toDateString())
    )
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (daySet.has(d.toDateString())) streak++
      else break
    }

    // ════════════════════════════════════════════════════════════
    // RECOMMENDATION ENGINE — rules checked in priority order
    // First rule that matches wins.
    // ════════════════════════════════════════════════════════════
    let recommendation = 'Keep going!'

    // 1. Not enough data yet
    if (totalProblems < 3) {
      recommendation = 'Log at least 3 problems to unlock personalised tips.'
    }

    // 2. Mostly unsolved overall — fundamentals issue
    else if (totalSolved / totalProblems < 0.4) {
      recommendation = `Your overall solve rate is low (${Math.round((totalSolved / totalProblems) * 100)}%). Focus on Easy problems to build confidence.`
    }

    // 3. Struggling hard problems specifically
    else if (hardAttempted >= 2 && hardAttempted > hardSolvedCount) {
      recommendation = `You've attempted ${hardAttempted} Hard problems without solving them. Try breaking them into sub-problems first.`
    }

    // 4. Specific topic with weak solve rate
    else if (weakTopics.length > 0) {
      const [topic, stats] = weakTopics[0]
      const rate = Math.round((stats.solved / stats.total) * 100)
      recommendation = `Your ${topic} solve rate is only ${rate}%. Revisit fundamentals there before moving on.`
    }

    // 5. All topics have zero solves
    else if (unsolvedTopics.length > 0 && totalProblems >= 3) {
      recommendation = `You haven't solved any ${unsolvedTopics[0]} problems yet. Try an Easy one to get started.`
    }

    // 6. Slow average solve time
    else if (avgTime > 45 && timedSolved.length >= 3) {
      recommendation = `Your average solve time is ${Math.round(avgTime)} mins. Practice pattern recognition — most problems reuse ~20 core patterns.`
    }

    // 7. Slow on specific topic
    else {
      const slowTopic = Object.entries(topicStats)
        .filter(([, s]) => s.timedCount >= 2 && (s.totalTime / s.timedCount) > 40)
        .sort((a, b) => (b[1].totalTime / b[1].timedCount) - (a[1].totalTime / a[1].timedCount))[0]

      if (slowTopic) {
        const avgTopicTime = Math.round(slowTopic[1].totalTime / slowTopic[1].timedCount)
        recommendation = `You average ${avgTopicTime} mins on ${slowTopic[0]} problems. Study the common patterns for this topic.`
      }

      // 8. Recent performance dipping
      else if (recentSolveRate < 0.4 && recent.length >= 4) {
        recommendation = `Your last ${recent.length} problems have a low solve rate. Consider dropping one difficulty level temporarily.`
      }

      // 9. Doing great — nudge to go harder
      else if (totalSolved >= 10 && difficultyCount.Hard === 0) {
        recommendation = `Great work on ${totalSolved} solves! Time to challenge yourself — try your first Hard problem.`
      }

      // 10. Streak reward / encourage consistency
      else if (streak >= 3) {
        recommendation = `${streak}-day streak! Consistency beats intensity — keep logging daily.`
      }

      // 11. No recent activity (all problems are old)
      else {
        const lastLogged = problems.reduce((latest, p) =>
          new Date(p.createdAt) > new Date(latest.createdAt) ? p : latest
        )
        const daysSince = Math.floor((Date.now() - new Date(lastLogged.createdAt)) / 86400000)
        if (daysSince >= 3) {
          recommendation = `You haven't logged in ${daysSince} days. Even one problem a day compounds fast.`
        } else {
          recommendation = `Solid progress! Keep diversifying your topics for a well-rounded skill set.`
        }
      }
    }

    res.json({
      topicMap,
      difficultyCount,
      totalSolved,
      totalProblems,
      avgSolveTime: Math.round(avgTime),
      streak,
      recommendation
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router