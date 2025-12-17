import { ReactNode } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import type { DashboardFilters, GraphVisibility } from '@/types/crm'

interface DashboardLayoutProps {
  children: ReactNode
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  graphVisibility: GraphVisibility
  onGraphVisibilityChange: (visibility: GraphVisibility) => void
}

const DashboardLayout = ({
  children,
  filters,
  onFiltersChange,
  graphVisibility,
  onGraphVisibilityChange,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8fa00]/10 via-transparent to-transparent rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8fa00]/5 via-transparent to-transparent -rotate-12" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#c8fa00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#c8fa00]/3 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar
        filters={filters}
        onFiltersChange={onFiltersChange}
        graphVisibility={graphVisibility}
        onGraphVisibilityChange={onGraphVisibilityChange}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="space-y-6">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
