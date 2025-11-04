import { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Dashboard CRM</h1>
          </div>
          <div className="ml-auto">
            <span className="text-sm text-muted-foreground">Max Chip</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout

