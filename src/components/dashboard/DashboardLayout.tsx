import { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header - Similar ao AtendeBot */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-[#3B82F6]" />
            <h1 className="text-xl font-semibold text-gray-900">Dashboard CRM</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Max Chip</span>
          </div>
        </div>
      </header>

      {/* Main Content - Fundo cinza claro como AtendeBot */}
      <main className="container mx-auto px-6 py-6">
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout

