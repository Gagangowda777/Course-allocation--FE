function ReportsPage() {
  return (
    <div className="page-shell">
      <div className="page-card">
        <h2>Reports</h2>
        <div className="page-list">
          <div className="page-item">
            <strong>Semester Allocation</strong>
            <span>74% seats allocated</span>
            <small>Updated 2 hours ago</small>
          </div>
          <div className="page-item">
            <strong>Faculty Demand</strong>
            <span>32 student requests</span>
            <small>Reviewed by faculty</small>
          </div>
          <div className="page-item">
            <strong>Department Capacity</strong>
            <span>92% resource utilization</span>
            <small>Needs approval</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
