import { useState } from 'react'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
}

function RegisterPage({ onRegisterSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setMessage({ type: 'success', text: 'Registration successful! You can now login.' })
      setForm(initialForm)
      if (onRegisterSuccess) {
        onRegisterSuccess(data.user)
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Something went wrong' })
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-badge">CA</div>
          <h2>Create account</h2>
          <p>Register for the Course Allocation system</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="input-group">
            <span>Full Name</span>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="input-group">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className="input-group">
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          <label className="input-group">
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {message.text ? (
            <div className={message.type === 'success' ? 'status success' : 'status error'}>
              {message.text}
            </div>
          ) : null}

          <button type="submit" className="login-button">Register</button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
