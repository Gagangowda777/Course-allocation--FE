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
            <div key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </section>

        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
