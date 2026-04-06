import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import api from '../api'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function Dashboard() {
  const [problems, setProblems] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  useEffect(() => {
    api.get('/problems').then(res => setProblems(res.data))
    api.get('/problems/analytics').then(res => setAnalytics(res.data))
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const deleteProblem = async (id) => {
    await api.delete(`/problems/${id}`)
    setProblems(problems.filter(p => p._id !== id))
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h2>Hey {name}!</h2>
        <div style={{display:'flex', gap:'10px'}}>
          <button style={styles.btn} onClick={() => navigate('/add')}>+ Add Problem</button>
          <button style={styles.logout} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Stats row */}
      {analytics && (
        <div style={styles.statsRow}>
          <div style={styles.card}><h3>{analytics.totalProblems}</h3><p>Total logged</p></div>
          <div style={styles.card}><h3>{analytics.totalSolved}</h3><p>Solved</p></div>
          <div style={styles.card}><h3>{analytics.difficultyCount.Hard}</h3><p>Hard solved</p></div>
          <div style={{...styles.card, background:'#ede9fe'}}>
            <p style={{fontSize:'13px'}}>{analytics.recommendation}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div style={styles.chartsRow}>
          <div style={styles.chartBox}>
            <h4>Problems by topic</h4>
            <Bar data={{
              labels: Object.keys(analytics.topicMap),
              datasets: [{ label: 'Problems', data: Object.values(analytics.topicMap),
                backgroundColor: '#4f46e5' }]
            }} />
          </div>
          <div style={styles.chartBox}>
            <h4>Difficulty split</h4>
            <Doughnut data={{
              labels: ['Easy', 'Medium', 'Hard'],
              datasets: [{ data: [analytics.difficultyCount.Easy, analytics.difficultyCount.Medium, analytics.difficultyCount.Hard],
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'] }]
            }} />
          </div>
        </div>
      )}

      {/* Problems table */}
      <div style={styles.tableBox}>
        <h4>All problems</h4>
        {problems.length === 0 && <p>No problems logged yet. Add one!</p>}
        {problems.map(p => (
          <div key={p._id} style={styles.row}>
            <span style={{fontWeight:'500'}}>{p.title}</span>
            <span style={{color: p.difficulty==='Easy'?'green':p.difficulty==='Hard'?'red':'orange'}}>{p.difficulty}</span>
            <span>{p.topic}</span>
            <span>{p.status}</span>
            <button style={styles.del} onClick={() => deleteProblem(p._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth:'900px', margin:'0 auto', padding:'2rem' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  btn: { padding:'8px 16px', background:'#4f46e5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' },
  logout: { padding:'8px 16px', background:'#eee', border:'none', borderRadius:'6px', cursor:'pointer' },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' },
  card: { background:'white', padding:'1rem', borderRadius:'8px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  chartsRow: { display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1rem', marginBottom:'1.5rem' },
  chartBox: { background:'white', padding:'1rem', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  tableBox: { background:'white', padding:'1rem', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  row: { display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:'1rem', padding:'10px 0', borderBottom:'1px solid #f0f0f0', alignItems:'center' },
  del: { padding:'4px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'4px', cursor:'pointer' }
}