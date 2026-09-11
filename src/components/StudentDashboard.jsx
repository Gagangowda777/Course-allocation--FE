import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'

function StudentDashboard({ user, onLogout }) {
  const [courses, setCourses] = useState([])
  const [preferences, setPreferences] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [priority, setPriority] = useState('1')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('courseAllocationToken')
        const response = await fetch('http://localhost:5000/api/dashboard/student', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load student dashboard.')
        }

        setCourses(data.openCourses || [])
        setPreferences(data.myAllocations || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  const handleSubmitPreference = async (event) => {
    event.preventDefault()

    if (!selectedCourseId) {
      return
    }

    try {
      const token = localStorage.getItem('courseAllocationToken')
      const response = await fetch('http://localhost:5000/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          preferenceRank: Number(priority),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save preference.')
      }

      const refreshed = await fetch('http://localhost:5000/api/dashboard/student', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const refreshedData = await refreshed.json()
      setPreferences(refreshedData.myAllocations || [])
      setSelectedCourseId('')
      setPriority('1')
    } catch (error) {
      console.error(error)
    }
  }

  const stats = [
    { label: 'Open Courses', value: String(courses.length) },
    { label: 'Saved Preferences', value: String(preferences.length) },
    { label: 'Status', value: preferences.some((item) => item.status === 'approved') ? 'Approved' : 'Pending' },
  ]

  return (
    <DashboardLayout title="Student Dashboard" userEmail={user.email} stats={stats} onLogout={onLogout}>
      <section className="content-grid">
        <div className="panel table-panel">
          <div className="panel-header">
            <h3>Available Courses</h3>
            <button type="button" className="action-button small">View catalog</button>
          </div>

          <div className="course-grid">
            {loading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p>No open courses available.</p>
            ) : (
              courses.map((course) => (
                <div key={course._id} className="course-card">
                  <div>
                    <strong>{course.name}</strong>
                    <span>{course.code}</span>
                  </div>
                  <div className="course-meta">
                    <small>{course.capacity} seats capacity</small>
                    <span className={course.status === 'open' ? 'status-badge success' : 'status-badge warning'}>
                      {course.status}
                    </span>
                  </div>
                  <button type="button" className="action-button secondary" onClick={() => setSelectedCourseId(course._id)}>
                    Add preference
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel side-panel">
          <h3>Course Preference Form</h3>
          <form className="priority-form" onSubmit={handleSubmitPreference}>
            <label>
              <span>Course</span>
              <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option value="1">Priority 1</option>
                <option value="2">Priority 2</option>
                <option value="3">Priority 3</option>
              </select>
            </label>

            <button type="submit" className="action-button">Save preference</button>
          </form>
        </div>
      </section>

      <section className="content-grid lower-grid">
        <div className="panel table-panel">
          <h3>Current Preferences</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preferences.length === 0 ? (
                  <tr><td colSpan="3">No preferences saved yet.</td></tr>
                ) : (
                  preferences.map((pref) => (
                    <tr key={pref._id}>
                      <td>{pref.course?.name || 'N/A'}</td>
                      <td>{pref.preferenceRank || 1}</td>
                      <td>
                        <span
                          className={
                            pref.status === 'approved'
                              ? 'status-badge success'
                              : pref.status === 'pending'
                                ? 'status-badge pending'
                                : 'status-badge warning'
                          }
                        >
                          {pref.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default StudentDashboard
