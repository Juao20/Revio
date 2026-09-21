import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from './stores/authStore'
import { getProfile } from './api/auth'

import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import CoursesList from './pages/CoursesList'
import Progress from './pages/Progress'
import Upload from './pages/Upload'
import CourseDetail from './pages/courses/CourseDetail'
import Quiz from './pages/study/Quiz'
import RevisionPlan from './pages/study/RevisionPlan'
import Exam from './pages/study/Exam'
import Profile from './pages/Profile'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import BugReport from './pages/BugReport'
import Notifications from './pages/Notifications'
import AppShell from './components/layout/AppShell'

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" />
}

function AppContent() {
  const { token, setAuth } = useAuthStore()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
    enabled: !!token,
    retry: false,
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
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Private — immersives, sans shell */}
      <Route path="/courses/:id/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
      <Route path="/courses/:id/exam" element={<PrivateRoute><Exam /></PrivateRoute>} />

      {/* Private — dans l'app shell (sidebar / bottom nav) */}
      <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesList />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/:id/plan" element={<RevisionPlan />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bug-report" element={<BugReport />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('revio_splash_seen'))
  const [splashDone, setSplashDone] = useState(() => !!sessionStorage.getItem('revio_splash_seen'))

  useEffect(() => {
    if (!showSplash) return
    sessionStorage.setItem('revio_splash_seen', 'true')
    const timer = setTimeout(() => {
      setShowSplash(false)
      setSplashDone(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [showSplash])

  if (showSplash) return <Splash />
  if (!splashDone) return null

  return <AppContent />
}