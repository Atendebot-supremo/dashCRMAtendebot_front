import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import FiltersBar from '@/components/dashboard/FiltersBar'
import FunilView from '@/components/funil/FunilView'
import RevenueMetrics from '@/components/metrics/RevenueMetrics'
import ConversionMetrics from '@/components/metrics/ConversionMetrics'
import SellerPerformance from '@/components/metrics/SellerPerformance'
import LossAnalysis from '@/components/metrics/LossAnalysis'
import TemporalComparison from '@/components/metrics/TemporalComparison'
import ProductAnalysis from '@/components/metrics/ProductAnalysis'
import { useCards } from '@/lib/api/queries'
import type { DashboardFilters } from '@/lib/api/helena-types'

const DashboardPage = () => {
  const [filters, setFilters] = useState<DashboardFilters>({})
  const { data: cards = [] } = useCards(filters)

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

