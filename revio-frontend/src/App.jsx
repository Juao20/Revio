import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from './stores/authStore'
import { getProfile } from './api/auth'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import CourseDetail from './pages/courses/CourseDetail'
import Quiz from './pages/study/Quiz'
import RevisionPlan from './pages/study/RevisionPlan'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import Exam from './pages/study/Exam'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import PremiumSuccess from './pages/PremiumSuccess'
import BugReport from './pages/BugReport'

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  const { token, setAuth } = useAuthStore()

  // Recharge le profil si token présent
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
    enabled: !!token, // seulement si token existe
  })

  useEffect(() => {
    if (profile && token) {
      setAuth(profile, token)
    }
  }, [profile, token])

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/premium/success" element={<PrivateRoute><PremiumSuccess /></PrivateRoute>} />

      {/* Private */}
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/premium" element={<PrivateRoute><Premium /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/bug-report" element={<PrivateRoute><BugReport /></PrivateRoute>} />
      <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
      <Route path="/courses/:id/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
      <Route path="/courses/:id/plan" element={<PrivateRoute><RevisionPlan /></PrivateRoute>} />
      <Route path="/courses/:id/exam" element={<PrivateRoute><Exam /></PrivateRoute>} />
    </Routes>
  )
}