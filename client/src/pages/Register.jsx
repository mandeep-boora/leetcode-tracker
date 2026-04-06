import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('name', res.data.name)
      navigate('/dashboard')
    } catch (err) {
      setError('Something went wrong. Try a different email.')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Name"
          onChange={e => setForm({...form, name: e.target.value})} />
        <input style={styles.input} placeholder="Email"
          onChange={e => setForm({...form, email: e.target.value})} />
        <input style={styles.input} placeholder="Password" type="password"
          onChange={e => setForm({...form, password: e.target.value})} />
        <button style={styles.btn} onClick={handleSubmit}>Register</button>
        <p>Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f0f0' },
  box: { background:'white', padding:'2rem', borderRadius:'10px', width:'320px', display:'flex', flexDirection:'column', gap:'1rem' },
  input: { padding:'10px', borderRadius:'6px', border:'1px solid #ccc', fontSize:'14px' },
  btn: { padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'15px' },
  error: { color:'red', fontSize:'13px' }
}