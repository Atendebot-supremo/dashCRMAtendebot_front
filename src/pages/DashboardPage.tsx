import { useState, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'

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

  // Log para debug
  const cardsData = cards.data || []
  console.group('📊 [DashboardPage] Análise completa dos dados')
  console.log('Total de cards:', cardsData.length)
  console.log('Etapas únicas:', [...new Set(cardsData.map(c => c.stepId))])
  console.log('Cards com valor monetário:', cardsData.filter(c => c.monetaryAmount).length)
  console.log('Responsáveis únicos:', [...new Set(cardsData.map(c => c.responsibleUserId).filter(Boolean))])
  console.log('Exemplo de 3 cards:', cardsData.slice(0, 3))
  console.groupEnd()
  
  // Análise de distribuição por etapa
  const cardsPorEtapa = cardsData.reduce((acc, card) => {
    const stepId = card.stepId || 'sem-etapa'
    acc[stepId] = (acc[stepId] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('📈 [DashboardPage] Cards por etapa:', cardsPorEtapa)
  
  // Análise de distribuição por responsável
  const cardsPorResponsavel = cardsData.reduce((acc, card) => {
    const responsavel = card.responsibleUserId || 'sem-responsavel'
    acc[responsavel] = (acc[responsavel] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('👥 [DashboardPage] Cards por responsável:', cardsPorResponsavel)

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters)
  }

  // Loading state
  if (isLoading && !cardsData.length) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#c8fa00]" />
            <span className="text-sm text-gray-600">Carregando dados...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-red-50 p-6">
            <span className="text-lg font-medium text-red-600">Erro ao carregar dados</span>
            <span className="text-sm text-red-500">{error?.message || 'Erro desconhecido'}</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
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
