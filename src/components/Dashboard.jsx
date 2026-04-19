import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import DashboardContent from './DashboardContent'
import ShiftsContent from './ShiftsContent'
import CertificateContent from './CertificateContent'
import GrievanceContent from './GrievanceContent'

const contentMap = {
  dashboard: <DashboardContent />,
  shifts: <ShiftsContent />,
  certificate: <CertificateContent />,
  grievance: <GrievanceContent />,
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar activeNav={activeNav} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {contentMap[activeNav]}
        </main>
      </div>
    </div>
  )
}
