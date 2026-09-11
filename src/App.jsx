import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import AdminDashboard from './components/AdminDashboard'
import StudentDashboard from './components/StudentDashboard'
import FacultyDashboard from './components/FacultyDashboard'
import NavigationBar from './components/NavigationBar'
import CoursePage from './components/CoursePage'
import ReportsPage from './components/ReportsPage'
import SettingsPage from './components/SettingsPage'

const roles = [
  {
    key: 'admin',
    label: 'Admin',
    subtitle: 'Manage courses, allocations and approvals',
    email: 'admin@courseallocation.edu',
    password: 'admin123',
  },
  {
    key: 'student',
    label: 'Student',
    subtitle: 'View course options and submit preferences',
    email: 'student@courseallocation.edu',
    password: 'student123',
  },
  {
    key: 'faculty',
    label: 'Faculty',
    subtitle: 'Review demand and assign priority preferences',
    email: 'faculty@courseallocation.edu',
    password: 'faculty123',
  },
]

const initialForm = {
  email: '',
  password: '',
}

function App() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('student')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('courseAllocationUser')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState({ type: '', text: '' })

  const activeRole = roles.find((role) => role.key === selectedRole)

  useEffect(() => {
    const token = localStorage.getItem('courseAllocationToken')

    if (!token) {
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Session expired')
        }

        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('courseAllocationUser', JSON.stringify(data.user))
      } catch (error) {
        setUser(null)
        localStorage.removeItem('courseAllocationUser')
        localStorage.removeItem('courseAllocationToken')
      }
    }

    validateToken()
  }, [])

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey)
    setMessage({ type: '', text: '' })
    setForm(initialForm)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.email || !form.password) {
      setMessage({
        type: 'error',
        text: 'Please enter both email and password.',
      })
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: selectedRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      setUser(data.user)
      localStorage.setItem('courseAllocationUser', JSON.stringify(data.user))
      localStorage.setItem('courseAllocationToken', data.token)
      setForm(initialForm)
      setMessage({ type: 'success', text: data.message })
      navigate('/dashboard')
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Invalid credentials for this role.',
      })
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('courseAllocationUser')
    localStorage.removeItem('courseAllocationToken')
    setMessage({ type: '', text: '' })
    setForm(initialForm)
    navigate('/login')
  }

  const renderDashboard = () => {
    if (!user) {
      return <Navigate to="/login" replace />
    }

    if (user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />
    }

    if (user.role === 'student') {
      return <StudentDashboard user={user} onLogout={handleLogout} />
    }

    return <FacultyDashboard user={user} onLogout={handleLogout} />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            roles={roles}
            selectedRole={selectedRole}
            activeRole={activeRole}
            form={form}
            message={message}
            onRoleChange={handleRoleChange}
            onFieldChange={handleChange}
            onSubmit={handleSubmit}
          />
        }
      />

      <Route path="/register" element={<RegisterPage onRegisterSuccess={() => navigate('/login')} />} />

      <Route
        path="/dashboard"
        element={
          <>
            {user ? <NavigationBar user={user} onLogout={handleLogout} /> : null}
            {user ? renderDashboard() : <Navigate to="/login" replace />}
          </>
        }
      />

      <Route
        path="/courses"
        element={
          <>
            {user ? <NavigationBar user={user} onLogout={handleLogout} /> : null}
            {user ? <CoursePage user={user} /> : <Navigate to="/login" replace />}
          </>
        }
      />

      <Route
        path="/reports"
        element={
          <>
            {user ? <NavigationBar user={user} onLogout={handleLogout} /> : null}
            {user ? <ReportsPage /> : <Navigate to="/login" replace />}
          </>
        }
      />

      <Route
        path="/settings"
        element={
          <>
            {user ? <NavigationBar user={user} onLogout={handleLogout} /> : null}
            {user ? <SettingsPage /> : <Navigate to="/login" replace />}
          </>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
