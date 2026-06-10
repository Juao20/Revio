import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from './stores/authStore'
import { getProfile } from './api/auth'

// Pages
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import CourseDetail from './pages/courses/CourseDetail'
import Quiz from './pages/study/Quiz'
import RevisionPlan from './pages/study/RevisionPlan'
import Exam from './pages/study/Exam'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import PremiumSuccess from './pages/PremiumSuccess'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import BugReport from './pages/BugReport'

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  const { token, setAuth } = useAuthStore()
  const [showSplash, setShowSplash] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  // Splash — une seule fois par onglet (sessionStorage)
  useEffect(() => {
    const seen = sessionStorage.getItem('revio_splash_seen')
    if (!seen) {
      setShowSplash(true)
      sessionStorage.setItem('revio_splash_seen', 'true')
      setTimeout(() => {
        setShowSplash(false)
        setSplashDone(true)
      }, 2500)
    } else {
      setSplashDone(true)
    }
  }, [])

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
    enabled: !!token,
  })

  useEffect(() => {
    if (profile && token) {
      setAuth(profile, token)
    }
  }, [profile, token])

  // Afficher le splash
  if (showSplash) return <Splash />

  // Attendre que le splash soit fini
  if (!splashDone) return null

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Private */}
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
      <Route path="/courses/:id/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
      <Route path="/courses/:id/plan" element={<PrivateRoute><RevisionPlan /></PrivateRoute>} />
      <Route path="/courses/:id/exam" element={<PrivateRoute><Exam /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/premium" element={<PrivateRoute><Premium /></PrivateRoute>} />
      <Route path="/premium/success" element={<PrivateRoute><PremiumSuccess /></PrivateRoute>} />
      <Route path="/bug-report" element={<PrivateRoute><BugReport /></PrivateRoute>} />
    </Routes>
  )
}