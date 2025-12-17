import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
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
import type { DashboardFilters, GraphVisibility } from '@/types/crm'

const DashboardPage = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<DashboardFilters>({})
  const [graphVisibility, setGraphVisibility] = useState<GraphVisibility>(() => {
    // Carregar do localStorage ou usar padrão (todos visíveis)
    const saved = localStorage.getItem('graph_visibility')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Se houver erro, usar padrão
      }
    }
    // Padrão: todos visíveis
    return {
      conversionMetrics: true,
      revenueMetrics: true,
      funilView: true,
      sellerPerformance: true,
      lossAnalysis: true,
      temporalComparison: true,
      productAnalysis: true,
    }
  })

  const { panels, cards, agents, activePanelId, isLoading, isError, error } = useDashboardData(filters)
  
  // Persistir visibilidade no localStorage
  useEffect(() => {
    localStorage.setItem('graph_visibility', JSON.stringify(graphVisibility))
  }, [graphVisibility])
  
  // Atualizar filtros com o panelId ativo
  useEffect(() => {
    if (activePanelId && !filters.panelId) {
      setFilters(prev => ({ ...prev, panelId: activePanelId }))
    }
  }, [activePanelId, filters.panelId])
  
  // Buscar etapas do painel - PRIMEIRO tenta usar as etapas que já vêm na lista de painéis
  useEffect(() => {
    if (activePanelId && panels.data) {
      // Tentar encontrar o painel na lista que já foi carregada
      const panelFromList = panels.data.find(p => p.id === activePanelId)
      
      if (panelFromList?.steps && Array.isArray(panelFromList.steps) && panelFromList.steps.length > 0) {
        console.log('✅ [DashboardPage] Usando etapas da lista de painéis:', panelFromList.steps.length)
        console.log('✅ [DashboardPage] Etapas encontradas:', JSON.stringify(panelFromList.steps.map(s => ({ id: s.id, title: s.title, position: s.position })), null, 2))
        updateStepMapping(panelFromList.steps)
        return
      } else {
        console.warn('⚠️ [DashboardPage] Painel encontrado na lista mas sem steps:', {
          panelId: activePanelId,
          hasPanel: !!panelFromList,
          hasSteps: !!panelFromList?.steps,
          stepsLength: panelFromList?.steps?.length || 0
        })
      }
    }
    
    // Se não encontrou na lista, tenta buscar via getPanelById (pode falhar)
    const fetchPanelDetails = async () => {
      if (activePanelId) {
        try {
          console.log('🔄 [DashboardPage] Tentando buscar detalhes do painel via API:', activePanelId)
          const panelDetails = await helenaClient.getPanelById(activePanelId)
          
          // Se o painel tiver steps, atualizar o mapeamento
          if (panelDetails?.steps && Array.isArray(panelDetails.steps)) {
            console.log('✅ [DashboardPage] Atualizando mapeamento de etapas via API:', panelDetails.steps.length)
            console.log('✅ [DashboardPage] Etapas:', JSON.stringify(panelDetails.steps, null, 2))
            updateStepMapping(panelDetails.steps)
          } else {
            console.warn('⚠️ [DashboardPage] Painel não tem steps ou steps não é array')
          }
        } catch (error) {
          console.warn('⚠️ [DashboardPage] Erro ao buscar detalhes do painel (pode ser normal se a rota não existir):', error)
          // Não é um erro crítico, as etapas podem vir dos cards
        }
      }
    }
    
    fetchPanelDetails()
  }, [activePanelId, panels.data])

  const cardsData = cards.data || []

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters)
  }

  const handleGraphVisibilityChange = (visibility: GraphVisibility) => {
    setGraphVisibility(visibility)
  }

  const handleSyncData = () => {
    // Invalidar todas as queries relacionadas ao dashboard para forçar nova busca
    queryClient.invalidateQueries({ queryKey: ['crm'] })
  }

  // Loading state
  if (isLoading && !cardsData.length) {
    return (
      <DashboardLayout
        filters={filters}
        onFiltersChange={handleFiltersChange}
        graphVisibility={graphVisibility}
        onGraphVisibilityChange={handleGraphVisibilityChange}
        onSyncData={handleSyncData}
      >
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
      <DashboardLayout
        filters={filters}
        onFiltersChange={handleFiltersChange}
        graphVisibility={graphVisibility}
        onGraphVisibilityChange={handleGraphVisibilityChange}
        onSyncData={handleSyncData}
      >
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
    <DashboardLayout
      filters={filters}
      onFiltersChange={handleFiltersChange}
      graphVisibility={graphVisibility}
      onGraphVisibilityChange={handleGraphVisibilityChange}
      onSyncData={handleSyncData}
    >
      {/* Métricas de Conversão */}
      {graphVisibility.conversionMetrics && (
        <ConversionMetrics filters={filters} />
      )}

      {/* Métricas de Receita */}
      {graphVisibility.revenueMetrics && (
        <RevenueMetrics filters={filters} />
      )}

      {/* Funil de Vendas */}
      {graphVisibility.funilView && (
        <FunilView filters={filters} />
      )}

      {/* Performance por Vendedor */}
      {graphVisibility.sellerPerformance && (
        <SellerPerformance filters={filters} />
      )}

      {/* Análise de Perdas */}
      {graphVisibility.lossAnalysis && (
        <LossAnalysis filters={filters} />
      )}

      {/* Comparações Temporais */}
      {graphVisibility.temporalComparison && (
        <TemporalComparison filters={filters} />
      )}

      {/* Análise de Produtos */}
      {graphVisibility.productAnalysis && (
        <ProductAnalysis filters={filters} />
      )}

      {/* Mensagem quando nenhum gráfico está visível */}
      {Object.values(graphVisibility).every(v => !v) && (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700/50">
              <AlertCircle className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">Nenhum gráfico visível</p>
              <p className="text-sm text-gray-400 mt-2">
                Selecione os gráficos que deseja visualizar na sidebar
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default DashboardPage
