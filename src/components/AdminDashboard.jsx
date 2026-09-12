import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api'
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
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [approvalRequests, setApprovalRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeList, setActiveList] = useState(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('courseAllocationToken')
        const dashboardResponse = await fetch(`${API_BASE_URL}/api/dashboard/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const dashboardData = await dashboardResponse.json()

        if (!dashboardResponse.ok) {
          throw new Error(dashboardData.message || 'Failed to load admin dashboard.')
        }

        setSummary(dashboardData.summary)
        setCourses(Array.isArray(dashboardData.courses) ? dashboardData.courses : [])
        setStudents(Array.isArray(dashboardData.students) ? dashboardData.students : [])
        setFaculty(Array.isArray(dashboardData.faculty) ? dashboardData.faculty : [])
        setApprovalRequests(
          Array.isArray(dashboardData.pendingRequests)
            ? dashboardData.pendingRequests
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
      const response = await fetch(`${API_BASE_URL}/api/allocations/${id}/${action}`, {
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

  const stats = [
    { label: 'Courses', value: String(summary.courseCount), onClick: () => setActiveList('courses') },
    { label: 'Students', value: String(summary.studentCount), onClick: () => setActiveList('students') },
    { label: 'Pending Requests', value: String(summary.pendingAllocations), onClick: () => setActiveList('pending') },
    { label: 'Faculty Details', value: String(summary.facultyCount), onClick: () => setActiveList('faculty') },
  ]

  const summaries = [
    { label: 'Approved Allocations', value: String(summary.approvedAllocations) },
    { label: 'Faculty Members', value: String(summary.facultyCount) },
    { label: 'Open Courses', value: String(summary.courseCount) },
  ]

  return (
    <DashboardLayout title="Admin Dashboard" userEmail={user.email} stats={stats} onLogout={onLogout}>
      {activeList && (
        <section className="content-grid detail-list-grid">
          <div className="panel table-panel">
            <div className="panel-header">
              <h3>{activeList === 'courses' ? 'Course List' : activeList === 'students' ? 'Student List' : activeList === 'faculty' ? 'Faculty Detail List' : 'Pending Request List'}</h3>
              <button type="button" className="action-button small" onClick={() => setActiveList(null)}>Close</button>
            </div>

            <div className="table-wrap">
              {activeList === 'courses' && (
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Faculty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length === 0 ? (
                      <tr><td colSpan="5">No courses found.</td></tr>
                    ) : (
                      courses.map((course) => (
                        <tr key={course._id}>
                          <td>{course.code}</td>
                          <td>{course.name}</td>
                          <td>{course.department}</td>
                          <td>{course.faculty || 'TBD'}</td>
                          <td><span className="status-badge success">{course.status || 'open'}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeList === 'students' && (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan="3">No students found.</td></tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student._id}>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeList === 'faculty' && (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.length === 0 ? (
                      <tr><td colSpan="3">No faculty members found.</td></tr>
                    ) : (
                      faculty.map((member) => (
                        <tr key={member._id}>
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td>{member.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeList === 'pending' && (
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Student</th>
                      <th>Faculty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalRequests.length === 0 ? (
                      <tr><td colSpan="4">No pending approvals.</td></tr>
                    ) : (
                      approvalRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.course?.name || 'N/A'}</td>
                          <td>{request.student?.name || 'N/A'}</td>
                          <td>{request.course?.faculty || request.faculty || 'TBD'}</td>
                          <td><span className="status-badge pending">{request.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      )}

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
        </div>
      </section>
    </DashboardLayout>
  )
}

export default AdminDashboard
