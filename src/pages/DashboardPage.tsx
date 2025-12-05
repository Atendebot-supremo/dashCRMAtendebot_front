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
import { useCards, usePanels } from '@/lib/api/queries'
import { updateStepMapping } from '@/lib/utils/stage-mapping'
import { helenaClient } from '@/lib/api/helena-client'
import type { DashboardFilters } from '@/lib/api/helena-types'

const DashboardPage = () => {
  const [filters, setFilters] = useState<DashboardFilters>({})
  const { data: cards = [] } = useCards(filters)
  const { data: panelsResponse } = usePanels()
  
  // Buscar informações completas do painel para mapear etapas
  useEffect(() => {
    const fetchPanelDetails = async () => {
      if (panelsResponse?.items && panelsResponse.items.length > 0) {
        try {
          const firstPanel = panelsResponse.items[0]
          const panelDetails = await helenaClient.getPanelById(firstPanel.id)
          
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
  }, [panelsResponse])

  // Log para debug - ver estrutura dos dados
  console.group('📊 [DashboardPage] Análise completa dos dados')
  console.log('Total de cards:', cards.length)
  console.log('Etapas únicas:', [...new Set(cards.map(c => c.stepId))])
  console.log('Cards com valor monetário:', cards.filter(c => c.monetaryAmount).length)
  console.log('Responsáveis únicos:', [...new Set(cards.map(c => c.responsibleUserId).filter(Boolean))])
  console.log('Exemplo de 3 cards:', cards.slice(0, 3))
  console.groupEnd()
  
  // Análise de distribuição por etapa
  const cardsPorEtapa = cards.reduce((acc, card) => {
    const stepId = card.stepId || 'sem-etapa'
    acc[stepId] = (acc[stepId] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('📈 [DashboardPage] Cards por etapa:', cardsPorEtapa)
  
  // Análise de distribuição por responsável
  const cardsPorResponsavel = cards.reduce((acc, card) => {
    const responsavel = card.responsibleUserId || 'sem-responsavel'
    acc[responsavel] = (acc[responsavel] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('👥 [DashboardPage] Cards por responsável:', cardsPorResponsavel)

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters)
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

