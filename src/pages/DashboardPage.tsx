import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import FiltersBar from '@/components/dashboard/FiltersBar'
import FunilView from '@/components/funil/FunilView'
import RevenueMetrics from '@/components/metrics/RevenueMetrics'
import ConversionMetrics from '@/components/metrics/ConversionMetrics'
import SellerPerformance from '@/components/metrics/SellerPerformance'
import LossAnalysis from '@/components/metrics/LossAnalysis'
import TemporalComparison from '@/components/metrics/TemporalComparison'
import ProductAnalysis from '@/components/metrics/ProductAnalysis'
import { useDashboardData } from '@/lib/api/queries'
import { updateStepMapping } from '@/lib/utils/stage-mapping'
import { helenaClient } from '@/lib/api/helena-client'
import type { DashboardFilters } from '@/types/crm'

const DashboardPage = () => {
  const [filters, setFilters] = useState<DashboardFilters>({})
  const { panels, cards, agents, activePanelId, isLoading, isError, error } = useDashboardData(filters)
  
  // Atualizar filtros com o panelId ativo
  useEffect(() => {
    if (activePanelId && !filters.panelId) {
      setFilters(prev => ({ ...prev, panelId: activePanelId }))
    }
  }, [activePanelId, filters.panelId])
  
  // Buscar informações completas do painel para mapear etapas
  useEffect(() => {
    const fetchPanelDetails = async () => {
      if (activePanelId) {
        try {
          const panelDetails = await helenaClient.getPanelById(activePanelId)
          
          // Se o painel tiver steps, atualizar o mapeamento
          if (panelDetails?.steps && Array.isArray(panelDetails.steps)) {
            updateStepMapping(panelDetails.steps)
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes do painel:', error)
        }
      }
    }
    
    fetchPanelDetails()
  }, [activePanelId])

  const cardsData = cards.data || []

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters)
  }

  // Loading state
  if (isLoading && !cardsData.length) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#c8fa00]/20 blur-xl animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/80 border border-gray-700/50">
                <Loader2 className="h-8 w-8 animate-spin text-[#c8fa00]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white">Carregando dashboard</p>
              <p className="text-sm text-gray-500 mt-1">Buscando seus dados...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">Erro ao carregar dados</p>
              <p className="text-sm text-gray-400 mt-2">{error?.message || 'Erro desconhecido'}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2.5 rounded-lg bg-[#c8fa00] text-gray-900 font-semibold text-sm hover:bg-[#b8ea00] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8fa00]/10 border border-[#c8fa00]/20">
            <BarChart3 className="h-5 w-5 text-[#c8fa00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
            <p className="text-sm text-gray-500">Acompanhe o desempenho do seu CRM em tempo real</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FiltersBar filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Métricas de Conversão */}
      <ConversionMetrics filters={filters} />

      {/* Métricas de Receita */}
      <RevenueMetrics filters={filters} />

      {/* Funil de Vendas */}
      <FunilView filters={filters} />

      {/* Performance por Vendedor */}
      <SellerPerformance filters={filters} />

      {/* Análise de Perdas */}
      <LossAnalysis filters={filters} />

      {/* Comparações Temporais */}
      <TemporalComparison filters={filters} />

      {/* Análise de Produtos */}
      <ProductAnalysis filters={filters} />
    </DashboardLayout>
  )
}

export default DashboardPage
