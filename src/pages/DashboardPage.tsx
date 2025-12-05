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
import { crmClient } from '@/lib/api/crm-client'
import type { DashboardFilters } from '@/lib/api/helena-types'

const DashboardPage = () => {
  const { data: panels = [] } = usePanels()
  const firstPanelId = panels?.[0]?.id
  
  // Inicializar filtros com o primeiro painel
  const [filters, setFilters] = useState<DashboardFilters>({
    panelId: firstPanelId,
  })
  
  // Atualizar panelId quando os painéis carregarem
  useEffect(() => {
    if (firstPanelId && !filters.panelId) {
      setFilters(prev => ({ ...prev, panelId: firstPanelId }))
    }
  }, [firstPanelId, filters.panelId])
  
  const { data: cards = [] } = useCards(
    filters.panelId 
      ? {
          panelId: filters.panelId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          userId: filters.userId,
          channelId: filters.channelId,
        }
      : undefined,
    !!filters.panelId
  )
  
  // Buscar informações completas do painel selecionado para mapear etapas
  useEffect(() => {
    const fetchPanelDetails = async () => {
      if (filters.panelId) {
        try {
          const panelDetails = await crmClient.getPanelById(filters.panelId)
          
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
  }, [filters.panelId])

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
      <FiltersBar 
        filters={filters} 
        panels={panels}
        onFiltersChange={handleFiltersChange} 
      />

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

