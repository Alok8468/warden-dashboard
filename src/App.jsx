import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { BrandProvider } from './context/BrandContext'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Scan from './pages/Scan'
import Threats from './pages/Threats'
import Takedowns from './pages/Takedowns'
import Evidence from './pages/Evidence'
import Reports from './pages/Reports'
import Alerts from './pages/Alerts'
import Scheduler from './pages/Scheduler'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'

function AppShell({ children }) {
  return (
    <BrandProvider>
      <div className="flex min-h-screen" style={{ background: '#0d0d14' }}>
        <Sidebar />
        <main className="flex-1 md:ml-60 min-w-0 overflow-x-hidden pb-16 md:pb-0" style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>
    </BrandProvider>
  )
}

function P({ children }) {
  return <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/pricing"    element={<Pricing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/dashboard"  element={<P><Dashboard /></P>} />
        <Route path="/scan"       element={<P><Scan /></P>} />
        <Route path="/threats"    element={<P><Threats /></P>} />
        <Route path="/takedowns"  element={<P><Takedowns /></P>} />
        <Route path="/evidence"   element={<P><Evidence /></P>} />
        <Route path="/reports"    element={<P><Reports /></P>} />
        <Route path="/alerts"     element={<P><Alerts /></P>} />
        <Route path="/scheduler"  element={<P><Scheduler /></P>} />
        <Route path="/settings"   element={<P><Settings /></P>} />
        <Route path="/onboarding" element={<P><Onboarding /></P>} />
      </Routes>
    </BrowserRouter>
  )
}
