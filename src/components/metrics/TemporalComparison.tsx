import { useMemo } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import LineChart from '@/components/charts/LineChart'
import { useCards } from '@/lib/api/queries'
import { aggregateByPeriod } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import type { DashboardFilters, Card } from '@/types/crm'

interface TemporalComparisonProps {
  filters?: DashboardFilters
}

// Função para formatar período mensal (2024-12 -> Dez/2024)
const formatMonthPeriod = (period: string): string => {
  try {
    const [year, month] = period.split('-')
    if (!year || !month) {
      console.warn('⚠️ [TemporalComparison] Formato de período inválido:', period)
      return period
    }
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    const monthIndex = parseInt(month, 10) - 1
    if (monthIndex < 0 || monthIndex >= 12) {
      console.warn('⚠️ [TemporalComparison] Mês inválido:', month)
      return period
    }
    return `${monthNames[monthIndex]}/${year}`
  } catch (error) {
    console.error('❌ [TemporalComparison] Erro ao formatar período:', period, error)
    return period
  }
}


const TemporalComparison = ({ filters }: TemporalComparisonProps) => {
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

  // Dados mensais para o gráfico - BASEADO EM createdAt (data de criação)
  const monthlyData = useMemo(() => {
    console.log('📅 [TemporalComparison] ==========================================')
    console.log('📅 [TemporalComparison] Agregando por MÊS usando createdAt (data de criação)')
    console.log('📅 [TemporalComparison] Cards filtrados:', filteredCards.length)
    console.log('📅 [TemporalComparison] Filtros aplicados:', {
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      userId: filters?.userId,
      channelId: filters?.channelId,
    })
    
    // Verificar se há cards sem createdAt
    const cardsWithoutDate = filteredCards.filter(card => !card.createdAt)
    if (cardsWithoutDate.length > 0) {
      console.warn(`⚠️ [TemporalComparison] ${cardsWithoutDate.length} cards sem createdAt serão ignorados`)
    }
    
    // Log de alguns cards para verificar as datas de criação
    if (filteredCards.length > 0) {
      const cardsWithDate = filteredCards.filter(card => card.createdAt)
      const sampleCards = cardsWithDate.slice(0, 10).map(card => {
        const date = new Date(card.createdAt!)
        return {
          id: card.id,
          title: card.title,
          createdAt: card.createdAt,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          monthName: date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        }
      })
      console.log('📅 [TemporalComparison] Exemplo de cards com datas de criação (primeiros 10):', sampleCards)
      
      // Verificar distribuição de meses - TODOS OS CARDS
      const monthDistribution: Record<string, number> = {}
      const allDates: string[] = []
      filteredCards.forEach(card => {
        if (card.createdAt) {
          const date = new Date(card.createdAt)
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          monthDistribution[key] = (monthDistribution[key] || 0) + 1
          allDates.push(card.createdAt)
        }
      })
      console.log('📅 [TemporalComparison] Distribuição de cards por mês (antes da agregação):', monthDistribution)
      console.log('📅 [TemporalComparison] Total de cards com data:', cardsWithDate.length)
      console.log('📅 [TemporalComparison] Total de meses únicos encontrados:', Object.keys(monthDistribution).length)
      
      // Mostrar a data mais antiga e mais recente
      if (allDates.length > 0) {
        const sortedDates = allDates.sort()
        console.log('📅 [TemporalComparison] Data mais antiga:', sortedDates[0])
        console.log('📅 [TemporalComparison] Data mais recente:', sortedDates[sortedDates.length - 1])
      }
    }
    
    const aggregated = aggregateByPeriod(filteredCards, 'month')
    console.log('📅 [TemporalComparison] Dados agregados (RAW):', JSON.stringify(aggregated, null, 2))
    
    const data = Object.entries(aggregated)
      .map(([period, data]) => {
        const formatted = formatMonthPeriod(period)
        console.log(`📅 [TemporalComparison] Período: ${period} -> ${formatted}, Leads: ${data.count}`)
        return {
          period,
          periodFormatted: formatted,
          leads: data.count,
        }
      })
      .sort((a, b) => a.period.localeCompare(b.period))
    
    console.log('📅 [TemporalComparison] Dados finais para o gráfico:', JSON.stringify(data, null, 2))
    console.log('📅 [TemporalComparison] Total de períodos:', data.length)
    
    return data
  }, [filteredCards])

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
      <ChartCard title="Comparações Temporais" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        </div>
      </ChartCard>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <ChartCard title="Comparações Temporais" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </ChartCard>
    )
  }

  // Se houver apenas 1 ponto, mostrar mensagem informativa
  if (monthlyData.length === 1) {
    const singleData = monthlyData[0]
    return (
      <ChartCard 
        title="Comparação Mês a Mês - Quantidade de Leads"
        icon={<TrendingUp className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c8fa00]/10 border-2 border-[#c8fa00]/30">
              <TrendingUp className="h-10 w-10 text-[#c8fa00]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-2">{singleData.leads}</p>
              <p className="text-sm text-gray-400">Leads em {singleData.periodFormatted}</p>
            </div>
            <p className="text-xs text-gray-500 max-w-md">
              Para visualizar o gráfico de linha, é necessário ter dados de pelo menos 2 meses diferentes.
            </p>
          </div>
        </div>
      </ChartCard>
    )
  }

  const chartData = monthlyData.map(item => ({
    name: item.periodFormatted,
    leads: item.leads,
  }))

  console.log('📅 [TemporalComparison] Dados formatados para o gráfico:', JSON.stringify(chartData, null, 2))

  return (
    <ChartCard 
      title="Comparação Mês a Mês - Quantidade de Leads"
      icon={<TrendingUp className="h-4 w-4 text-[#c8fa00]" />}
    >
      <LineChart
        data={chartData}
        dataKey="name"
        lines={[
          {
            key: 'leads',
            name: 'Leads',
            color: '#c8fa00',
          },
        ]}
        xAxisKey="name"
        height={400}
      />
    </ChartCard>
  )
}

export default TemporalComparison
