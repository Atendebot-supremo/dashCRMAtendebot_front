import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import TestApiPage from './pages/TestApiPage'
import LoginPage from './pages/LoginPage'
import VerifyCodePage from './pages/VerifyCodePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { Toaster } from 'sonner'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-api"
          element={
            <ProtectedRoute>
              <TestApiPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  )
}

export default App

