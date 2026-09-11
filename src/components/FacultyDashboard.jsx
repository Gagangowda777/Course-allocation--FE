import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'

const initialLoadForm = {
  courseId: '',
  sections: 2,
  maxCapacity: 35,
}

function FacultyDashboard({ user, onLogout }) {
  const [assignedCourses, setAssignedCourses] = useState([])
  const [requests, setRequests] = useState([])
  const [loadForm, setLoadForm] = useState(initialLoadForm)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const token = localStorage.getItem('courseAllocationToken')
        const response = await fetch('http://localhost:5000/api/dashboard/faculty', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load faculty dashboard.')
        }

        setAssignedCourses(data.assignedCourses || [])
        setRequests(data.allocations || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchFacultyData()
  }, [])

  const handleLoadFormChange = (event) => {
    const { name, value } = event.target
    setLoadForm((previous) => ({
      ...previous,
      [name]: name === 'sections' || name === 'maxCapacity' ? Number(value) : value,
    }))
  }

  const handleLoadSubmit = async (event) => {
    event.preventDefault()

    if (!loadForm.courseId) {
      return
    }

    try {
      const token = localStorage.getItem('courseAllocationToken')
      const response = await fetch(`http://localhost:5000/api/courses/${loadForm.courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          faculty: user.name,
          capacity: loadForm.maxCapacity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update teaching load.')
      }

      setLoadForm(initialLoadForm)
    } catch (error) {
      console.error(error)
    }
  }

  const stats = [
    { label: 'Assigned Courses', value: String(assignedCourses.length) },
    { label: 'Student Requests', value: String(requests.length) },
    { label: 'Open Slots', value: String(assignedCourses.reduce((total, course) => total + (course.capacity || 0), 0)) },
  ]

  return (
    <DashboardLayout title="Faculty Dashboard" userEmail={user.email} stats={stats} onLogout={onLogout}>
      <section className="content-grid">
        <div className="panel table-panel">
          <div className="panel-header">
            <h3>Student Allocation Requests</h3>
            <button type="button" className="action-button small">View all</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="4">No allocation requests for your courses yet.</td></tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.student?.name || 'N/A'}</td>
                      <td>{request.course?.name || 'N/A'}</td>
                      <td>{request.preferenceRank || 1}</td>
                      <td><span className="status-badge pending">{request.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel side-panel">
          <h3>Teaching Load Form</h3>
          <form className="priority-form" onSubmit={handleLoadSubmit}>
            <label>
              <span>Course</span>
              <select name="courseId" value={loadForm.courseId} onChange={handleLoadFormChange}>
                <option value="">Select course</option>
                {assignedCourses.map((course) => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Sections</span>
              <input type="number" name="sections" min="1" max="5" value={loadForm.sections} onChange={handleLoadFormChange} />
            </label>

            <label>
              <span>Maximum Capacity</span>
              <input type="number" name="maxCapacity" min="10" max="100" value={loadForm.maxCapacity} onChange={handleLoadFormChange} />
            </label>

            <button type="submit" className="action-button">Update allocation</button>
          </form>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default FacultyDashboard
