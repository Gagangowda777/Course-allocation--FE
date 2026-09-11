import { NavLink } from 'react-router-dom'

function NavigationBar({ user, onLogout }) {
  return (
    <nav className="top-navigation">
      <div className="nav-brand">
        <div className="brand-badge small">CA</div>
        <span>Course Allocation</span>
      </div>

      <div className="nav-links">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/courses" className="nav-link">Courses</NavLink>
        <NavLink to="/reports" className="nav-link">Reports</NavLink>
        <NavLink to="/settings" className="nav-link">Settings</NavLink>
      </div>

      <div className="nav-user">
        <span>{user?.role || 'User'}</span>
        <button type="button" className="logout-button" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  )
}

export default NavigationBar
