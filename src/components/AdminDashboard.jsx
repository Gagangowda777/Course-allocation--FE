import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'

const initialCourseForm = {
  code: '',
  name: '',
  department: '',
  credits: 3,
  capacity: 30,
  description: '',
  faculty: 'TBD',
  status: 'open',
}

function AdminDashboard({ user, onLogout }) {
  const [summary, setSummary] = useState({
    courseCount: 0,
    studentCount: 0,
    facultyCount: 0,
    pendingAllocations: 0,
    approvedAllocations: 0,
  })
  const [approvalRequests, setApprovalRequests] = useState([])
  const [courseForm, setCourseForm] = useState(initialCourseForm)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('courseAllocationToken')
        const [dashboardResponse, allocationsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/admin', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('http://localhost:5000/api/allocations/all', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        const dashboardData = await dashboardResponse.json()
        const allocationsData = await allocationsResponse.json()

        if (!dashboardResponse.ok) {
          throw new Error(dashboardData.message || 'Failed to load admin dashboard.')
        }

        setSummary(dashboardData.summary)
        setApprovalRequests(
          Array.isArray(allocationsData)
            ? allocationsData.filter((item) => item.status === 'pending')
            : []
        )
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const handleApproval = async (id, action) => {
    try {
      const token = localStorage.getItem('courseAllocationToken')
      const response = await fetch(`http://localhost:5000/api/allocations/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Request failed.')
      }

      setApprovalRequests((previous) => previous.filter((request) => request._id !== id))
      setSummary((previous) => ({
        ...previous,
        pendingAllocations: Math.max(0, previous.pendingAllocations - 1),
        approvedAllocations: action === 'approve' ? previous.approvedAllocations + 1 : previous.approvedAllocations,
      }))
    } catch (error) {
      console.error(error)
    }
  }

  const handleCourseChange = (event) => {
    const { name, value } = event.target
    setCourseForm((previous) => ({
      ...previous,
      [name]: name === 'credits' || name === 'capacity' ? Number(value) : value,
    }))
  }

  const handleCourseSubmit = async (event) => {
    event.preventDefault()

    try {
      const token = localStorage.getItem('courseAllocationToken')
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Course creation failed.')
      }

      setCourseForm(initialCourseForm)
      setSummary((previous) => ({
        ...previous,
        courseCount: previous.courseCount + 1,
      }))
    } catch (error) {
      console.error(error)
    }
  }

  const stats = [
    { label: 'Courses', value: String(summary.courseCount) },
    { label: 'Students', value: String(summary.studentCount) },
    { label: 'Pending Requests', value: String(summary.pendingAllocations) },
  ]

  const summaries = [
    { label: 'Approved Allocations', value: String(summary.approvedAllocations) },
    { label: 'Faculty Members', value: String(summary.facultyCount) },
    { label: 'Open Courses', value: String(summary.courseCount) },
  ]

  return (
    <DashboardLayout title="Admin Dashboard" userEmail={user.email} stats={stats} onLogout={onLogout}>
      <section className="content-grid">
        <div className="panel table-panel">
          <div className="panel-header">
            <h3>Pending Approvals</h3>
            <button type="button" className="action-button small">Review all</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Student</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5">Loading approvals...</td></tr>
                ) : approvalRequests.length === 0 ? (
                  <tr><td colSpan="5">No pending approvals.</td></tr>
                ) : (
                  approvalRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.course?.name || 'N/A'}</td>
                      <td>{request.student?.name || 'N/A'}</td>
                      <td>{request.preferenceRank || 1}</td>
                      <td><span className="status-badge pending">{request.status}</span></td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="approve-btn" onClick={() => handleApproval(request._id, 'approve')}>Approve</button>
                          <button type="button" className="reject-btn" onClick={() => handleApproval(request._id, 'reject')}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel side-panel">
          <h3>Allocation Summary</h3>
          <div className="summary-list">
            {summaries.map((summaryItem) => (
              <div key={summaryItem.label} className="summary-item">
                <span>{summaryItem.label}</span>
                <strong>{summaryItem.value}</strong>
              </div>
            ))}
          </div>
          <button type="button" className="action-button">Export final report</button>
          <button type="button" className="action-button secondary">Send notification</button>
        </div>
      </section>

      <section className="content-grid lower-grid">
        <div className="panel side-panel">
          <h3>Create Course</h3>
          <form className="priority-form" onSubmit={handleCourseSubmit}>
            <label>
              <span>Course Code</span>
              <input name="code" value={courseForm.code} onChange={handleCourseChange} placeholder="CS401" required />
            </label>
            <label>
              <span>Course Name</span>
              <input name="name" value={courseForm.name} onChange={handleCourseChange} placeholder="Machine Learning" required />
            </label>
            <label>
              <span>Department</span>
              <input name="department" value={courseForm.department} onChange={handleCourseChange} placeholder="Computer Science" required />
            </label>
            <label>
              <span>Credits</span>
              <input type="number" name="credits" min="1" max="6" value={courseForm.credits} onChange={handleCourseChange} />
            </label>
            <label>
              <span>Capacity</span>
              <input type="number" name="capacity" min="10" max="200" value={courseForm.capacity} onChange={handleCourseChange} />
            </label>
            <label>
              <span>Faculty</span>
              <input name="faculty" value={courseForm.faculty} onChange={handleCourseChange} />
            </label>
            <label>
              <span>Description</span>
              <textarea name="description" value={courseForm.description} onChange={handleCourseChange} rows="3" />
            </label>
            <button type="submit" className="action-button">Create Course</button>
          </form>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default AdminDashboard
