import { useMemo } from 'react'
import { Package, TrendingUp, TableIcon } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import { useCards } from '@/lib/api/queries'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
  calculateConversionRate,
} from '@/lib/utils/calculations'
import { calculateDaysBetween } from '@/lib/utils/date'
import { formatCurrency, formatPercentage, formatDays } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

interface ProductAnalysisProps {
  filters?: DashboardFilters
}

const ProductAnalysis = ({ filters }: ProductAnalysisProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)

  const filteredCards = useMemo(() => {
    let filtered: Card[] = cards

    if (filters?.startDate || filters?.endDate) {
      filtered = filterCardsByPeriod(
        filtered,
        filters.startDate,
        filters.endDate
      )
    }

    if (filters?.userId) {
      filtered = filterCardsByUser(filtered, filters.userId)
    }

    if (filters?.channelId) {
      filtered = filterCardsByChannel(filtered, filters.channelId)
    }

    return filtered
  }, [cards, filters])

  const productMetrics = useMemo(() => {
    console.log('📦 [ProductAnalysis] ==========================================')
    console.log('📦 [ProductAnalysis] Analisando produtos/serviços')
    console.log('📦 [ProductAnalysis] Total de cards filtrados:', filteredCards.length)
    
    const metrics: Record<
      string,
      {
        name: string
        totalCards: number
        closedCards: number
        totalRevenue: number
        conversionRate: number
        averageTicket: number
        averageClosingTime: number
      }
    > = {}

    // Contar produtos únicos
    const productsFound = new Set<string>()
    
    filteredCards.forEach((card) => {
      // Usar customFields['produto-servi-o'] para o nome do produto
      const product = (card.customFields?.['produto-servi-o'] as string) || 'Sem produto/serviço'
      productsFound.add(product)
      
      if (!metrics[product]) {
        metrics[product] = {
          name: product,
          totalCards: 0,
          closedCards: 0,
          totalRevenue: 0,
          conversionRate: 0,
          averageTicket: 0,
          averageClosingTime: 0,
        }
      }

      metrics[product].totalCards += 1

      // Considerar cards fechados: stepPhase === 'FINAL' ou com monetaryAmount > 0
      const isClosed = card.stepPhase === 'FINAL' || (card.monetaryAmount && card.monetaryAmount > 0)
      
      if (isClosed) {
        metrics[product].closedCards += 1
        
        // Usar customFields['faturamento'] se disponível, senão usar monetaryAmount
        const faturamento = card.customFields?.['faturamento']
        let revenue = 0
        
        if (faturamento) {
          // Se faturamento é uma string, tentar converter para número
          if (typeof faturamento === 'string') {
            // Remover caracteres não numéricos (R$, espaços, pontos, vírgulas)
            const cleaned = faturamento.replace(/[^\d,.-]/g, '').replace(',', '.')
            revenue = parseFloat(cleaned) || 0
          } else if (typeof faturamento === 'number') {
            revenue = faturamento
          }
        }
        
        // Se não tiver faturamento, usar monetaryAmount
        if (revenue === 0) {
          revenue = card.monetaryAmount || 0
        }
        
        metrics[product].totalRevenue += revenue

        if (card.createdAt && card.updatedAt) {
          const days = calculateDaysBetween(card.createdAt, card.updatedAt)
          metrics[product].averageClosingTime += days
        }
      }
    })

    Object.values(metrics).forEach((metric) => {
      metric.conversionRate = calculateConversionRate(
        metric.closedCards,
        metric.totalCards
      )
      metric.averageTicket =
        metric.closedCards > 0
          ? metric.totalRevenue / metric.closedCards
          : 0
      metric.averageClosingTime =
        metric.closedCards > 0
          ? metric.averageClosingTime / metric.closedCards
          : 0
    })

    const sortedMetrics = Object.values(metrics)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
    
    console.log('📦 [ProductAnalysis] Produtos únicos encontrados:', Array.from(productsFound))
    console.log('📦 [ProductAnalysis] Métricas calculadas:', sortedMetrics.map(m => ({
      produto: m.name,
      totalCards: m.totalCards,
      closedCards: m.closedCards,
      totalRevenue: m.totalRevenue,
    })))
    console.log('📦 [ProductAnalysis] ==========================================')
    
    return sortedMetrics
  }, [filteredCards])

  const revenueChartData = useMemo(() => {
    return productMetrics.map((metric) => ({
      name: metric.name,
      revenue: metric.totalRevenue,
    }))
  }, [productMetrics])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Análise de Produtos" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        </div>
      </ChartCard>
    )
  }

  if (productMetrics.length === 0) {
    return (
      <ChartCard title="Análise de Produtos" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Package className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Receita por Produto/Serviço */}
      <ChartCard 
        title="Receita por Produto/Serviço"
        icon={<TrendingUp className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {revenueChartData.map((item, index) => (
            <div 
              key={index}
              className="group relative p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 hover:border-[#c8fa00]/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c8fa00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-[#c8fa00] flex-shrink-0" />
                  <p className="text-xs text-gray-400 truncate group-hover:text-[#c8fa00] transition-colors" title={item.name}>
                    {item.name}
                  </p>
                </div>
                <p className="text-lg font-bold text-white group-hover:text-[#c8fa00] transition-colors">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Tabela de Ranking */}
      <ChartCard 
        title="Ranking de Produtos/Serviços"
        icon={<TableIcon className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-semibold text-gray-300">#</th>
                <th className="text-left p-4 font-semibold text-gray-300">Produto/Serviço</th>
                <th className="text-right p-4 font-semibold text-gray-300">Vendas</th>
                <th className="text-right p-4 font-semibold text-gray-300">Taxa de Conversão</th>
                <th className="text-right p-4 font-semibold text-gray-300">Ticket Médio</th>
                <th className="text-right p-4 font-semibold text-gray-300">Tempo Fechamento</th>
                <th className="text-right p-4 font-semibold text-gray-300">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {productMetrics.map((metric, index) => (
                <tr key={index} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-[#c8fa00] text-gray-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-[#c8fa00]" />
                      <span className="font-medium text-white">{metric.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c8fa00]/10 text-[#c8fa00] border border-[#c8fa00]/20">
                      {metric.closedCards}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${metric.conversionRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatPercentage(metric.conversionRate)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-300">
                    {formatCurrency(metric.averageTicket)}
                  </td>
                  <td className="p-4 text-right text-gray-400">
                    {formatDays(metric.averageClosingTime)}
                  </td>
                  <td className="p-4 text-right font-bold text-white">
                    {formatCurrency(metric.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

export default ProductAnalysis
