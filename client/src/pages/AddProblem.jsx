import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const DIFF = {
  Easy:   { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  Medium: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  Hard:   { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
}

export default function AddProblem() {
  const [form, setForm] = useState({
    title: '', difficulty: 'Easy', topic: '', status: 'Solved',
    timeTaken: '', attempts: 1, notes: ''
  })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await api.post('/problems', form)
      navigate('/dashboard')
    } catch {
      alert('Error saving problem')
      setSaving(false)
    }
  }

  const dc = DIFF[form.difficulty]

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.topbar}>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back to dashboard
          </button>
          <span style={{...s.diffPill, background: dc.bg, color: dc.color, border: `1.5px solid ${dc.border}`}}>
            {form.difficulty}
          </span>
        </div>

        <h1 style={s.title}>Log a problem</h1>
        <p style={s.sub}>Record what you solved and how you approached it</p>

        <div style={s.form}>

          {/* Title */}
          <div style={s.field}>
            <label style={s.label}>Problem title</label>
            <input
              placeholder="e.g. Two Sum, Binary Search, LRU Cache…"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>

          {/* Difficulty + Topic */}
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Topic</label>
              <input
                placeholder="Arrays, Trees, DP…"
                value={form.topic}
                onChange={e => setForm({...form, topic: e.target.value})}
              />
            </div>
          </div>

          {/* Status + Time */}
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>Solved</option>
                <option>Attempted</option>
                <option>Unsolved</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Time taken (mins)</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={form.timeTaken}
                onChange={e => setForm({...form, timeTaken: e.target.value})}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={s.field}>
            <label style={s.label}>Notes / approach</label>
            <textarea
              placeholder="Key insight, algorithm used, what tripped you up…"
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
            />
          </div>

          <div style={s.actions}>
            <button style={s.cancelBtn} onClick={() => navigate('/dashboard')}>Cancel</button>
            <button
              style={{...s.saveBtn, opacity: saving ? 0.7 : 1}}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save problem →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem 1rem',
  },
  container: { width: '100%', maxWidth: '580px' },
  topbar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.75rem',
  },
  backBtn: {
    background: 'transparent',
    border: '1.5px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 14px',
    fontSize: '13px', fontWeight: '500',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
  },
  diffPill: {
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px', fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.4px',
  },
  title: {
    fontSize: '30px', fontWeight: '700',
    letterSpacing: '-0.8px', marginBottom: '6px',
    color: 'var(--text-primary)',
  },
  sub: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '2rem' },
  form: {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.75rem',
    display: 'flex', flexDirection: 'column', gap: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: {
    fontSize: '11px', fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.9px',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  actions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.25rem' },
  cancelBtn: {
    background: 'transparent',
    border: '1.5px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 20px',
    fontSize: '14px', fontWeight: '500',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--accent)',
    color: '#fff', border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 24px',
    fontSize: '14px', fontWeight: '700',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
  },
}
