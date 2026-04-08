import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import api from '../api'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const DIFF_STYLE = {
  Easy:     { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', dot: '#34d399' },
  Medium:   { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', dot: '#fbbf24' },
  Hard:     { bg: 'rgba(248,113,113,0.12)', color: '#f87171', dot: '#f87171' },
}
const STATUS_STYLE = {
  Solved:    { color: '#34d399' },
  Attempted: { color: '#fbbf24' },
  Unsolved:  { color: '#888899' },
}

const chartDefaults = {
  plugins: { legend: { display: false }, tooltip: {
    backgroundColor: '#1a1a1e',
    borderColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    titleColor: '#f0f0f2',
    bodyColor: '#888899',
    padding: 10,
  }},
}

export default function Dashboard() {
  const [problems, setProblems] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || 'there'

  useEffect(() => {
    api.get('/problems').then(res => setProblems(res.data))
    api.get('/problems/analytics').then(res => setAnalytics(res.data))
  }, [])

  const logout = () => { localStorage.clear(); navigate('/login') }

  const deleteProblem = async (id) => {
    await api.delete(`/problems/${id}`)
    setProblems(problems.filter(p => p._id !== id))
  }

  const filtered = problems.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.topic?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>DSA<span style={s.logoAccent}>.</span></div>
        <nav style={s.nav}>
          <div style={s.navItem}>Overview</div>
          <div style={{...s.navItem, color: 'var(--text-muted)'}}>Problems</div>
          <div style={{...s.navItem, color: 'var(--text-muted)'}}>Analytics</div>
        </nav>
        <div style={s.sidebarBottom}>
          <div style={s.userBadge}>
            <div style={s.avatar}>{name[0]?.toUpperCase()}</div>
            <span style={s.userName}>{name}</span>
          </div>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        {/* Top bar */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.greeting}>Hey, {name} 👋</h1>
            <p style={s.greetingSub}>Here's your DSA progress</p>
          </div>
          <button style={s.addBtn} onClick={() => navigate('/add')}>+ Log problem</button>
        </div>

        {/* Stats */}
        {analytics && (
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Total logged</span>
              <span style={s.statValue}>{analytics.totalProblems}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Solved</span>
              <span style={{...s.statValue, color: 'var(--green)'}}>{analytics.totalSolved}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Hard problems</span>
              <span style={{...s.statValue, color: 'var(--red)'}}>{analytics.difficultyCount?.Hard ?? 0}</span>
            </div>
            <div style={{...s.statCard, gridColumn: 'span 1'}}>
              <span style={s.statLabel}>Tip</span>
              <span style={{fontSize: '13px', color: 'var(--accent)', lineHeight: 1.5}}>
                {analytics.recommendation}
              </span>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <div style={s.chartsRow}>
            <div style={s.chartCard}>
              <p style={s.cardTitle}>Problems by topic</p>
              <Bar
                data={{
                  labels: Object.keys(analytics.topicMap),
                  datasets: [{
                    label: 'Problems',
                    data: Object.values(analytics.topicMap),
                    backgroundColor: 'rgba(124,108,255,0.7)',
                    borderRadius: 6,
                    borderSkipped: false,
                  }]
                }}
                options={{
                  ...chartDefaults,
                  scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#888899', font: { size: 11 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#888899', font: { size: 11 } } },
                  },
                }}
              />
            </div>
            <div style={s.chartCard}>
              <p style={s.cardTitle}>Difficulty split</p>
              <div style={{maxWidth: '220px', margin: '0 auto'}}>
                <Doughnut
                  data={{
                    labels: ['Easy', 'Medium', 'Hard'],
                    datasets: [{
                      data: [
                        analytics.difficultyCount?.Easy ?? 0,
                        analytics.difficultyCount?.Medium ?? 0,
                        analytics.difficultyCount?.Hard ?? 0,
                      ],
                      backgroundColor: ['#34d399', '#fbbf24', '#f87171'],
                      borderColor: '#141416',
                      borderWidth: 3,
                    }]
                  }}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: '#888899', padding: 16, font: { size: 12 }, boxWidth: 10 }
                      },
                    },
                    cutout: '70%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Problems Table */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <p style={s.cardTitle}>All problems <span style={s.count}>{filtered.length}</span></p>
            <input
              style={{...s.searchInput}}
              placeholder="Search by title or topic..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 && (
            <div style={s.empty}>
              {search ? 'No results found' : 'No problems logged yet. Add one!'}
            </div>
          )}

          {filtered.length > 0 && (
            <div style={s.table}>
              <div style={s.tableHead}>
                <span>Problem</span>
                <span>Topic</span>
                <span>Difficulty</span>
                <span>Status</span>
                <span></span>
              </div>
              {filtered.map(p => {
                const ds = DIFF_STYLE[p.difficulty] || DIFF_STYLE.Easy
                const ss = STATUS_STYLE[p.status] || STATUS_STYLE.Unsolved
                return (
                  <div key={p._id} style={s.tableRow}>
                    <span style={s.problemTitle}>{p.title}</span>
                    <span style={s.topicBadge}>{p.topic}</span>
                    <span>
                      <span style={{...s.badge, background: ds.bg, color: ds.color}}>
                        {p.difficulty}
                      </span>
                    </span>
                    <span style={{...s.statusText, color: ss.color}}>{p.status}</span>
                    <button style={s.delBtn} onClick={() => deleteProblem(p._id)}>✕</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },

  /* Sidebar */
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.75rem 1.25rem',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logo: {
    fontFamily: 'var(--font-mono)',
    fontSize: '20px',
    fontWeight: '500',
    letterSpacing: '-0.5px',
    marginBottom: '2rem',
  },
  logoAccent: { color: 'var(--accent)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    background: 'rgba(124,108,255,0.1)',
  },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '10px' },
  userBadge: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
  },
  avatar: {
    width: '30px', height: '30px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-glow)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '600', color: 'var(--accent)',
  },
  userName: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px',
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  },

  /* Main */
  main: { flex: 1, padding: '2rem 2.5rem', maxWidth: '900px' },
  topbar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '2rem',
  },
  greeting: { fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' },
  greetingSub: { fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' },
  addBtn: {
    background: 'var(--accent)',
    color: 'white', border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 20px',
    fontSize: '14px', fontWeight: '600',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  /* Stats */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  statLabel: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' },
  statValue: { fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', fontFamily: 'var(--font-mono)' },

  /* Charts */
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  chartCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
  },
  cardTitle: {
    fontSize: '13px', fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.8px',
    marginBottom: '1rem',
    display: 'flex', alignItems: 'center', gap: '8px',
  },

  /* Table */
  tableCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
  },
  tableHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
  },
  count: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  searchInput: {
    width: '240px',
    padding: '8px 12px',
    fontSize: '13px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'var(--font-display)',
  },
  empty: {
    textAlign: 'center', padding: '3rem',
    color: 'var(--text-muted)', fontSize: '14px',
  },
  table: { display: 'flex', flexDirection: 'column' },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
    padding: '8px 12px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '4px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
    alignItems: 'center',
    padding: '12px 12px',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.15s',
    gap: '8px',
  },
  problemTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
  topicBadge: { fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'var(--font-mono)',
  },
  statusText: { fontSize: '13px', fontWeight: '500' },
  delBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.15s',
    fontFamily: 'var(--font-display)',
  },
}
