import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import api from '../api'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const DIFF_STYLE = {
  Easy:     { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  Medium:   { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  Hard:     { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
}
const STATUS_COLOR = {
  Solved:    '#15B441',
  Attempted: '#D97706',
  Unsolved:  '#AAAAA0',
}

const tooltipStyle = {
  backgroundColor: '#fff',
  borderColor: 'rgba(0,0,0,0.08)',
  borderWidth: 1,
  titleColor: '#1A1A14',
  bodyColor: '#6B6B5E',
  padding: 10,
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
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
    setProblems(p => p.filter(x => x._id !== id))
  }

  const filtered = problems.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.topic?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.page}>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>D</div>
          <span style={s.logoText}>DSA Tracker</span>
        </div>

        <nav style={s.nav}>
          <div style={s.navActive}>Overview</div>
          <div style={s.navItem}>Problems</div>
          <div style={s.navItem}>Analytics</div>
        </nav>

        {analytics && (
          <div style={s.streakBox}>
            <span style={s.streakNum}>{analytics.streak ?? 0}</span>
            <span style={s.streakLabel}>day streak 🔥</span>
          </div>
        )}

        <div style={s.sidebarBottom}>
          <div style={s.userRow}>
            <div style={s.avatar}>{name[0]?.toUpperCase()}</div>
            <span style={s.userName}>{name}</span>
          </div>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>

        {/* Topbar */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.greeting}>Hey, {name}! 👋</h1>
            <p style={s.greetingSub}>Here's your DSA progress</p>
          </div>
          <button style={s.addBtn} onClick={() => navigate('/add')}>+ Log problem</button>
        </div>

        {/* Stat cards */}
        {analytics && (
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Total logged</span>
              <span style={s.statValue}>{analytics.totalProblems}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Solved</span>
              <span style={{...s.statValue, color: 'var(--accent)'}}>{analytics.totalSolved}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Hard solved</span>
              <span style={{...s.statValue, color: '#DC2626'}}>{analytics.difficultyCount?.Hard ?? 0}</span>
            </div>
            <div style={{...s.statCard, background: '#F0FDF4', border: '1.5px solid #BBF7D0'}}>
              <span style={{...s.statLabel, color: '#166534'}}>💡 Tip</span>
              <span style={{fontSize: '13px', color: '#15803D', lineHeight: 1.55, fontWeight: '500'}}>
                {analytics.recommendation}
              </span>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <div style={s.chartsRow}>
            <div style={s.chartCard}>
              <p style={s.cardLabel}>Problems by topic</p>
              <Bar
                data={{
                  labels: Object.keys(analytics.topicMap),
                  datasets: [{
                    label: 'Problems',
                    data: Object.values(analytics.topicMap),
                    backgroundColor: 'rgba(21,180,65,0.75)',
                    borderRadius: 7,
                    borderSkipped: false,
                  }]
                }}
                options={{
                  plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } },
                  scales: {
                    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6B6B5E', font: { size: 11 } } },
                    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6B6B5E', font: { size: 11 } } },
                  },
                }}
              />
            </div>
            <div style={s.chartCard}>
              <p style={s.cardLabel}>Difficulty split</p>
              <div style={{maxWidth: '210px', margin: '0 auto'}}>
                <Doughnut
                  data={{
                    labels: ['Easy', 'Medium', 'Hard'],
                    datasets: [{
                      data: [
                        analytics.difficultyCount?.Easy ?? 0,
                        analytics.difficultyCount?.Medium ?? 0,
                        analytics.difficultyCount?.Hard ?? 0,
                      ],
                      backgroundColor: ['#15B441', '#D97706', '#DC2626'],
                      borderColor: '#fff',
                      borderWidth: 3,
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: '#6B6B5E', padding: 16, font: { size: 12 }, boxWidth: 10 }
                      },
                      tooltip: { ...tooltipStyle }
                    },
                    cutout: '68%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Problems table */}
        <div style={s.tableCard}>
          <div style={s.tableTop}>
            <div style={s.tableTitleRow}>
              <p style={s.cardLabel}>All problems</p>
              <span style={s.countBadge}>{filtered.length}</span>
            </div>
            <input
              style={s.search}
              placeholder="Search title or topic…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div style={s.empty}>
              {search ? 'No results found.' : 'No problems yet. Log your first one!'}
            </div>
          ) : (
            <div>
              <div style={s.tableHead}>
                <span>Problem</span>
                <span>Topic</span>
                <span>Difficulty</span>
                <span>Status</span>
                <span></span>
              </div>
              {filtered.map(p => {
                const ds = DIFF_STYLE[p.difficulty] || DIFF_STYLE.Easy
                return (
                  <div key={p._id} style={s.tableRow}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={s.problemTitle}>{p.title}</span>
                    <span style={s.topicTag}>{p.topic}</span>
                    <span>
                      <span style={{
                        ...s.diffBadge,
                        background: ds.bg,
                        color: ds.color,
                        border: `1px solid ${ds.border}`,
                      }}>
                        {p.difficulty}
                      </span>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: STATUS_COLOR[p.status] || '#888' }}>
                      {p.status}
                    </span>
                    <button style={s.delBtn} onClick={() => deleteProblem(p._id)}
                      onMouseEnter={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.color='#DC2626' }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)' }}
                    >✕</button>
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
    width: '230px',
    minHeight: '100vh',
    background: 'var(--bg-card)',
    borderRight: '1.5px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    padding: '1.75rem 1.25rem',
    position: 'sticky', top: 0, height: '100vh',
    boxShadow: 'var(--shadow-sm)',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '2.25rem',
  },
  logoIcon: {
    width: '32px', height: '32px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: '700',
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px', fontWeight: '500',
    color: 'var(--text-primary)',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 },
  navActive: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px', fontWeight: '600',
    background: 'var(--accent-dim)',
    color: 'var(--accent-dark)',
    cursor: 'pointer',
  },
  navItem: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px', fontWeight: '500',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  streakBox: {
    background: 'var(--bg-elevated)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    display: 'flex', alignItems: 'baseline', gap: '6px',
    marginBottom: '1rem',
  },
  streakNum: { fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: '500', color: 'var(--text-primary)' },
  streakLabel: { fontSize: '12px', color: 'var(--text-secondary)' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '8px' },
  userRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--bg-elevated)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
  },
  avatar: {
    width: '30px', height: '30px',
    background: 'var(--accent-dim)',
    border: '1.5px solid var(--accent-glow)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700', color: 'var(--accent-dark)',
  },
  userName: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' },
  logoutBtn: {
    background: 'transparent',
    border: '1.5px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px',
    fontSize: '13px', fontWeight: '500',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer', width: '100%', textAlign: 'center',
  },

  /* Main */
  main: { flex: 1, padding: '2.25rem 2.5rem', maxWidth: '900px' },
  topbar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '2rem',
  },
  greeting: { fontSize: '28px', fontWeight: '700', letterSpacing: '-0.6px', color: 'var(--text-primary)' },
  greetingSub: { fontSize: '14px', color: 'var(--text-secondary)', marginTop: '3px' },
  addBtn: {
    background: 'var(--accent)',
    color: '#fff', border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 22px',
    fontSize: '14px', fontWeight: '700',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px var(--accent-glow)',
  },

  /* Stats */
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    gap: '12px', marginBottom: '1.5rem',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '8px',
    boxShadow: 'var(--shadow-sm)',
  },
  statLabel: {
    fontSize: '11px', fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.9px',
  },
  statValue: {
    fontSize: '34px', fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '-1px', color: 'var(--text-primary)',
  },

  /* Charts */
  chartsRow: {
    display: 'grid', gridTemplateColumns: '3fr 2fr',
    gap: '12px', marginBottom: '1.5rem',
  },
  chartCard: {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
  },
  cardLabel: {
    fontSize: '11px', fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.9px',
    marginBottom: '1rem',
  },

  /* Table */
  tableCard: {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
  },
  tableTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
  },
  tableTitleRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  countBadge: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '11px', fontWeight: '600',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  search: {
    width: '220px',
    padding: '8px 12px',
    fontSize: '13px',
    background: 'var(--bg-elevated)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'var(--font-display)',
  },
  empty: {
    textAlign: 'center', padding: '3rem',
    color: 'var(--text-muted)', fontSize: '14px',
  },
  tableHead: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 36px',
    padding: '8px 10px',
    fontSize: '11px', fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.8px',
    borderBottom: '1.5px solid var(--border)',
    marginBottom: '2px',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 36px',
    alignItems: 'center', padding: '11px 10px',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.1s',
    background: 'transparent',
    gap: '8px',
  },
  problemTitle: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
  topicTag: {
    fontSize: '12px', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  diffBadge: {
    display: 'inline-block',
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '700',
    fontFamily: 'var(--font-mono)',
  },
  delBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer', fontSize: '12px',
    padding: '5px', borderRadius: '5px',
    fontFamily: 'var(--font-display)',
    transition: 'background 0.15s, color 0.15s',
  },
}
