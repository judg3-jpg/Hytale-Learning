import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Punishments from './pages/Punishments'
import ActivityLog from './pages/ActivityLog'
import Settings from './pages/Settings'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:id" element={<Players />} />
        <Route path="/punishments" element={<Punishments />} />
        <Route path="/activity" element={<ActivityLog />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  )
}

export default App
