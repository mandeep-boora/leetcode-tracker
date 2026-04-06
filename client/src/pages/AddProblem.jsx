import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function AddProblem() {
  const [form, setForm] = useState({
    title: '', difficulty: 'Easy', topic: '', status: 'Solved', timeTaken: '', attempts: 1, notes: ''
  })
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      await api.post('/problems', form)
      navigate('/dashboard')
    } catch (err) {
      alert('Error saving problem')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Log a Problem</h2>
        <input style={styles.input} placeholder="Problem title"
          onChange={e => setForm({...form, title: e.target.value})} />
        <select style={styles.input} onChange={e => setForm({...form, difficulty: e.target.value})}>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <input style={styles.input} placeholder="Topic (e.g. Arrays, Trees)"
          onChange={e => setForm({...form, topic: e.target.value})} />
        <select style={styles.input} onChange={e => setForm({...form, status: e.target.value})}>
          <option>Solved</option><option>Attempted</option><option>Unsolved</option>
        </select>
        <input style={styles.input} placeholder="Time taken (minutes)" type="number"
          onChange={e => setForm({...form, timeTaken: e.target.value})} />
        <textarea style={styles.input} placeholder="Notes / approach"
          onChange={e => setForm({...form, notes: e.target.value})} />
        <button style={styles.btn} onClick={handleSubmit}>Save Problem</button>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    </div>
  )
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f0f0f0' },
  box: { background:'white', padding:'2rem', borderRadius:'10px', width:'360px', display:'flex', flexDirection:'column', gap:'1rem' },
  input: { padding:'10px', borderRadius:'6px', border:'1px solid #ccc', fontSize:'14px', width:'100%' },
  btn: { padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' },
  back: { padding:'10px', background:'#eee', border:'none', borderRadius:'6px', cursor:'pointer' }
}