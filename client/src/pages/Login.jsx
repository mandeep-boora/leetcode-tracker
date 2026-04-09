import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
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
      {/* Decorative blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoIcon}>D</div>
          <span style={s.logoText}>DSA Tracker</span>
        </div>

        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in to continue your streak</p>

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

        <button
          style={{...s.btn, opacity: loading ? 0.7 : 1}}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={s.footer}>No account? <Link to="/register">Create one free</Link></p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(21,180,65,0.12) 0%, transparent 70%)',
    top: '-100px', right: '-100px',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(21,180,65,0.07) 0%, transparent 70%)',
    bottom: '-80px', left: '-80px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '2.5rem',
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    boxShadow: 'var(--shadow-md)',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '0.4rem',
  },
  logoIcon: {
    width: '34px', height: '34px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700',
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  title: {
    fontSize: '26px', fontWeight: '700',
    letterSpacing: '-0.6px',
    color: 'var(--text-primary)',
  },
  sub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '-0.5rem',
  },
  error: {
    background: '#FEF2F2',
    border: '1.5px solid #FECACA',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--red)',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  },
  btn: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    marginTop: '0.3rem',
    letterSpacing: '0.1px',
    border: 'none',
    cursor: 'pointer',
  },
  footer: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
}
