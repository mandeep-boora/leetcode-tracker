import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('name', res.data.name)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.grid} aria-hidden="true">
        {Array.from({length: 80}).map((_, i) => <div key={i} style={s.cell} />)}
      </div>
      <div style={s.card}>
        <div style={s.logo}>DSA<span style={s.logoAccent}>.</span></div>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in to track your progress</p>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            onChange={e => setForm({...form, password: e.target.value})}
          />
        </div>

        <button style={{...s.btn, opacity: loading ? 0.6 : 1}} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>

        <p style={s.footer}>No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gridTemplateRows: 'repeat(8, 1fr)',
    pointerEvents: 'none',
    opacity: 0.3,
  },
  cell: {
    border: '1px solid rgba(124,108,255,0.08)',
  },
  card: {
    position: 'relative',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '2.5rem',
    width: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 0 60px rgba(124,108,255,0.06)',
  },
  logo: {
    fontFamily: 'var(--font-mono)',
    fontSize: '22px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
    marginBottom: '0.5rem',
  },
  logoAccent: { color: 'var(--accent)' },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  sub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '-0.5rem',
  },
  error: {
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--red)',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' },
  btn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.2px',
    marginTop: '0.5rem',
    transition: 'opacity 0.15s, transform 0.1s',
  },
  footer: { fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' },
}
