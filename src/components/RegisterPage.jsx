import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../api'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
}

function RegisterPage({ onRegisterSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
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
        <div className="login-card-head">
          <span className="login-title">Course Management</span>
          <p className="login-subtitle">
            Manage academic planning, faculty assignments, and student course access in one place.
          </p>
        </div>

        <div className="role-switcher" aria-label="Registration role selector">
          {['student', 'faculty', 'admin'].map((role) => (
            <button
              key={role}
              type="button"
              className={form.role === role ? 'role-button active' : 'role-button'}
              onClick={() => setForm({ ...form, role })}
            >
              {role[0].toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form login-form">
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
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <svg className="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M10.6 10.6a3 3 0 0 0 4.8 4.8" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M9.88 5.08A10.5 10.5 0 0 1 12 5c4.2 0 7.7 2.4 9.8 7a18.8 18.8 0 0 1-3.2 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M6.2 6.2A18.7 18.7 0 0 0 2.2 12a18.5 18.5 0 0 0 3.6 5.1" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg className="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {message.text ? (
            <div className={message.type === 'success' ? 'status success' : 'status error'}>
              {message.text}
            </div>
          ) : null}

          <button type="submit" className="login-button">Create account</button>

          <div className="register-row">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
