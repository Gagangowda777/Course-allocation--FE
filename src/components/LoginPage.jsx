import { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginPage({
  roles,
  selectedRole,
  activeRole,
  form,
  message,
  onRoleChange,
  onFieldChange,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-head">
          <span className="login-title">Course Management</span>
          <p className="login-subtitle">
            Manage academic planning, faculty assignments, and student course access in one place.
          </p>
        </div>

        <div className="role-switcher" aria-label="Login role selector">
          {roles.map((role) => (
            <button
              key={role.key}
              type="button"
              className={selectedRole === role.key ? 'role-button active' : 'role-button'}
              onClick={() => onRoleChange(role.key)}
            >
              {role.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <label className="input-group">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onFieldChange}
              placeholder={activeRole.email}
              autoComplete="email"
            />
          </label>

          <label className="input-group">
            <span>Password</span>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={onFieldChange}
                placeholder="Enter password"
                autoComplete="current-password"
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

          <button type="submit" className="login-button">
            Sign in
          </button>

          <div className="register-row">
            <span>Don’t have an account?</span>
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </div>
        </form>

        <div className="demo-box">
          <span>Demo credentials</span>
          <p>
            <strong>Email:</strong> {activeRole.email}
          </p>
          <p>
            <strong>Password:</strong> {activeRole.password}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
