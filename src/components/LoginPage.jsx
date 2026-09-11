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
  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="brand-panel">
          <div className="brand-badge">CA</div>
          <h1>Course Allocation</h1>
          <p>
            Streamline course registration, faculty planning, and academic allocation
            in one secure portal.
          </p>

          <div className="info-card">
            <span className="info-label">Access</span>
            <strong>{activeRole.label} Portal</strong>
            <small>{activeRole.subtitle}</small>
          </div>
        </div>

        <div className="form-panel">
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

          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in as {activeRole.label}</p>
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
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onFieldChange}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#">Forgot password?</a>
            </div>

            {message.text ? (
              <div className={message.type === 'success' ? 'status success' : 'status error'}>
                {message.text}
              </div>
            ) : null}

            <button type="submit" className="login-button">
              Login as {activeRole.label}
            </button>

            <Link to="/register" className="auth-link">
              Create an account
            </Link>
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
    </div>
  )
}

export default LoginPage
