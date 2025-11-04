import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import TestApiPage from './pages/TestApiPage'
import { Toaster } from 'sonner'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/test-api" element={<TestApiPage />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App

