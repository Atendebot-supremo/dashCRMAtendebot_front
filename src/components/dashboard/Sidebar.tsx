import { useState, useEffect, ReactNode } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  LogOut, 
  User, 
  ChevronDown,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import FiltersBar from '@/components/dashboard/FiltersBar'
import GraphVisibilityControls from '@/components/dashboard/GraphVisibilityControls'
import type { AuthUser, DashboardFilters, GraphVisibility } from '@/types/crm'

interface SidebarProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  graphVisibility: GraphVisibility
  onGraphVisibilityChange: (visibility: GraphVisibility) => void
}

const Sidebar = ({
  filters,
  onFiltersChange,
  graphVisibility,
  onGraphVisibilityChange,
}: SidebarProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Carregar estado do localStorage
    const saved = localStorage.getItem('sidebar_collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [isMobile, setIsMobile] = useState(false)

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Carregar dados do usuário
  useEffect(() => {
    const userData = apiClient.getUserData()
    if (userData) {
      setUser(userData)
      
      apiClient.getUserProfile()
        .then((response) => {
          if (response.success && response.data) {
            setUser(response.data)
            localStorage.setItem('user_data', JSON.stringify(response.data))
          }
        })
        .catch((error) => {
          console.log('Perfil completo não disponível, usando dados do login:', error)
        })
    }
  }, [])

  // Persistir estado de colapso
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  const handleLogout = () => {
    apiClient.logout()
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Em mobile, sidebar é overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile: Botão para abrir drawer */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 text-white shadow-lg lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile: Drawer overlay */}
        {!isCollapsed && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsCollapsed(true)}
            />
            <aside className="fixed left-0 top-0 h-full w-80 bg-gray-800/95 backdrop-blur-xl border-r border-gray-700/50 z-50 overflow-y-auto lg:hidden">
              <SidebarContent
                user={user}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
                handleLogout={handleLogout}
                filters={filters}
                onFiltersChange={onFiltersChange}
                graphVisibility={graphVisibility}
                onGraphVisibilityChange={onGraphVisibilityChange}
                onClose={() => setIsCollapsed(true)}
                isMobile={true}
              />
            </aside>
          </>
        )}
      </>
    )
  }

  // Desktop: Sidebar fixa
  return (
    <aside
      className={`relative h-screen bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      } flex flex-col`}
    >
      <SidebarContent
        user={user}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        handleLogout={handleLogout}
        filters={filters}
        onFiltersChange={onFiltersChange}
        graphVisibility={graphVisibility}
        onGraphVisibilityChange={onGraphVisibilityChange}
        isCollapsed={isCollapsed}
        isMobile={false}
      />

      {/* Toggle Button */}
      <button
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shadow-lg"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  )
}

interface SidebarContentProps {
  user: AuthUser | null
  showUserMenu: boolean
  setShowUserMenu: (show: boolean) => void
  handleLogout: () => void
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  graphVisibility: GraphVisibility
  onGraphVisibilityChange: (visibility: GraphVisibility) => void
  isCollapsed?: boolean
  isMobile?: boolean
  onClose?: () => void
}

const SidebarContent = ({
  user,
  showUserMenu,
  setShowUserMenu,
  handleLogout,
  filters,
  onFiltersChange,
  graphVisibility,
  onGraphVisibilityChange,
  isCollapsed = false,
  isMobile = false,
  onClose,
}: SidebarContentProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header - Logo e Nome do App */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <img
            src="/logo_verde-300x78.png"
            alt="AtendeBot"
            className={`object-contain transition-all ${isCollapsed ? 'h-8 w-8' : 'h-10'}`}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8fa00]/10">
                  <LayoutDashboard className="h-4 w-4 text-[#c8fa00]" />
                </div>
                <span className="text-base font-semibold text-white">Dashboard CRM</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Perfil do Usuário */}
      <div className="p-4 border-b border-gray-700/50">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c8fa00] to-[#a8d600] text-gray-900 shadow-lg shadow-[#c8fa00]/20">
              <User className="h-5 w-5" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-300 transition-all duration-200 hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50"
              aria-label="Menu do usuário"
              tabIndex={0}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c8fa00] to-[#a8d600] text-gray-900 shadow-lg shadow-[#c8fa00]/20 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-white truncate">
                  {user?.userName || user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.name || 'Administrador'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute left-0 top-full mt-2 w-full rounded-xl border border-gray-700/50 bg-gray-800/95 backdrop-blur-xl py-2 shadow-2xl shadow-black/30 z-50">
                <div className="border-b border-gray-700/50 px-4 py-3">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.userName || user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {user?.name || user?.email || user?.phone || 'Sem informação'}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 rounded-lg"
                    tabIndex={0}
                    aria-label="Sair da conta"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo Scrollável */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Filtros */}
          {!isCollapsed && (
            <div className="space-y-4">
              <FiltersBar filters={filters} onFiltersChange={onFiltersChange} />
            </div>
          )}

          {/* Controle de Gráficos */}
          {!isCollapsed && (
            <div className="space-y-4">
              <GraphVisibilityControls
                visibility={graphVisibility}
                onVisibilityChange={onGraphVisibilityChange}
              />
            </div>
          )}

          {/* Versão Colapsada - Apenas Ícones */}
          {isCollapsed && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8fa00]/10 border border-[#c8fa00]/20">
                  <LayoutDashboard className="h-5 w-5 text-[#c8fa00]" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700/30 border border-gray-600/30">
                  <LayoutDashboard className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700/50">
          <p className="text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} AtendeBot
          </p>
        </div>
      )}

      {/* Mobile: Botão Fechar */}
      {isMobile && onClose && (
        <div className="p-4 border-t border-gray-700/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  )
}

export default Sidebar

