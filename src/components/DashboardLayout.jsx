function DashboardLayout({ title, userEmail, stats, onLogout, children }) {
  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{title}</h1>
          </div>
          <div className="user-pill">{userEmail}</div>
        </header>

        <section className="stats-grid">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              className="stat-card"
              onClick={stat.onClick}
              disabled={!stat.onClick}
            >
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </button>
          ))}
        </section>

        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
