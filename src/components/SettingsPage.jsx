function SettingsPage() {
  return (
    <div className="page-shell">
      <div className="page-card">
        <h2>Settings</h2>
        <div className="settings-list">
          <div className="setting-item">
            <span>Email notifications</span>
            <button type="button" className="toggle-button on">Enabled</button>
          </div>
          <div className="setting-item">
            <span>Course preference reminders</span>
            <button type="button" className="toggle-button on">Enabled</button>
          </div>
          <div className="setting-item">
            <span>Faculty review alerts</span>
            <button type="button" className="toggle-button off">Disabled</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
