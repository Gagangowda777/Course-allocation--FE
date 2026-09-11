import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api'

const emptyCourseForm = {
  code: '',
  name: '',
  department: '',
  credits: 3,
  capacity: 30,
  faculty: 'TBD',
  description: '',
  status: 'open',
}

function CoursePage({ user }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [form, setForm] = useState(emptyCourseForm)
  const [editingCourseId, setEditingCourseId] = useState(null)

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('courseAllocationToken')
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load courses.')
      }

      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to load courses.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: name === 'credits' || name === 'capacity' ? Number(value) : value,
    }))
  }

  const resetForm = () => {
    setForm(emptyCourseForm)
    setEditingCourseId(null)
    setMessage({ type: '', text: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (user?.role !== 'admin') {
      return
    }

    try {
      const token = localStorage.getItem('courseAllocationToken')
      const isEditing = Boolean(editingCourseId)
      const request = {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }

      const response = await fetch(
        isEditing ? `${API_BASE_URL}/api/courses/${editingCourseId}` : `${API_BASE_URL}/api/courses`,
        request
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Course save failed.')
      }

      if (isEditing) {
        setCourses((previous) => previous.map((course) => (course._id === editingCourseId ? data.course : course)))
      } else {
        setCourses((previous) => [data.course, ...previous])
      }

      setMessage({
        type: 'success',
        text: isEditing ? 'Course updated successfully.' : 'Course created successfully.',
      })
      resetForm()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to save the course.',
      })
    }
  }

  const handleEdit = (course) => {
    setEditingCourseId(course._id)
    setForm({
      code: course.code || '',
      name: course.name || '',
      department: course.department || '',
      credits: course.credits || 3,
      capacity: course.capacity || 30,
      faculty: course.faculty || 'TBD',
      description: course.description || '',
      status: course.status || 'open',
    })
    setMessage({ type: '', text: '' })
  }

  const handleDelete = async (courseId) => {
    if (user?.role !== 'admin') {
      return
    }

    const confirmed = window.confirm('Delete this course permanently?')
    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem('courseAllocationToken')
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Course deletion failed.')
      }

      setCourses((previous) => previous.filter((course) => course._id !== courseId))
      if (editingCourseId === courseId) {
        resetForm()
      }
      setMessage({ type: 'success', text: 'Course deleted successfully.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Unable to delete the course.',
      })
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="page-shell">
      <div className="page-card">
        <header className="course-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2>Course Management</h2>
          </div>
          {isAdmin ? (
            <button type="button" className="action-button small" onClick={resetForm}>Reset form</button>
          ) : null}
        </header>

        {isAdmin ? (
          <form className="course-form" onSubmit={handleSubmit}>
            <div className="course-form-grid">
              <label>
                <span>Course Code</span>
                <input name="code" value={form.code} onChange={handleFieldChange} placeholder="CS401" required />
              </label>
              <label>
                <span>Course Name</span>
                <input name="name" value={form.name} onChange={handleFieldChange} placeholder="Machine Learning" required />
              </label>
              <label>
                <span>Department</span>
                <input name="department" value={form.department} onChange={handleFieldChange} placeholder="Computer Science" required />
              </label>
              <label>
                <span>Credits</span>
                <input type="number" name="credits" min="1" max="6" value={form.credits} onChange={handleFieldChange} />
              </label>
              <label>
                <span>Capacity</span>
                <input type="number" name="capacity" min="10" max="200" value={form.capacity} onChange={handleFieldChange} />
              </label>
              <label>
                <span>Faculty</span>
                <input name="faculty" value={form.faculty} onChange={handleFieldChange} />
              </label>
              <label>
                <span>Status</span>
                <select name="status" value={form.status} onChange={handleFieldChange}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                </select>
              </label>
            </div>

            <label>
              <span>Description</span>
              <textarea name="description" rows="3" value={form.description} onChange={handleFieldChange} />
            </label>

            {message.text ? <div className={`status ${message.type}`}>{message.text}</div> : null}

            <button type="submit" className="action-button">
              {editingCourseId ? 'Update Course' : 'Create Course'}
            </button>
          </form>
        ) : null}

        <div className="course-list-wrapper">
          <h3>Available Courses</h3>

          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p>No courses available.</p>
          ) : isAdmin ? (
            <div className="table-wrap">
              <table className="course-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Credits</th>
                    <th>Capacity</th>
                    <th>Faculty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.code}</td>
                      <td>{course.name}</td>
                      <td>{course.department}</td>
                      <td>{course.credits}</td>
                      <td>{course.capacity}</td>
                      <td>{course.faculty || 'TBD'}</td>
                      <td>
                        <span className={`status-badge ${course.status === 'open' ? 'success' : course.status === 'pending' ? 'warning' : 'pending'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="approve-btn" onClick={() => handleEdit(course)}>Edit</button>
                          <button type="button" className="reject-btn" onClick={() => handleDelete(course._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div key={course._id} className="course-card">
                  <div>
                    <strong>{course.code}</strong>
                    <span>{course.name}</span>
                  </div>
                  <small>{course.department}</small>
                  <div className="course-meta">
                    <span>{course.credits} credits</span>
                    <span>{course.capacity} seats</span>
                  </div>
                  <small>Instructor: {course.faculty || 'TBD'}</small>
                  <small>Status: {course.status}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursePage
