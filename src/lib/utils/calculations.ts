import type { Card, DashboardFilters } from '@/types/crm'
import { calculateDaysBetween, calculateMinutesBetween } from './date'

export interface FunnelMetrics {
  stage: string
  leads: number
  value: number
  conversionRate: number
  averageTime: number
}

export interface RevenueMetrics {
  totalRevenue: number
  averageTicket: number
  revenueBySeller: Record<string, number>
  revenueByChannel: Record<string, number>
}

export interface ConversionMetrics {
  overallConversionRate: number
  averageSalesCycle: number
  averageResponseTime: number
}

export const calculateConversionRate = (
  converted: number,
  total: number
): number => {
  if (total === 0) return 0
  return (converted / total) * 100
}

export const calculateAverageTicket = (
  totalValue: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 0
  return totalValue / totalCount
}

export const calculateSalesCycle = (cards: Card[]): number => {
  const cycles = cards
    .filter((card) => card.createdAt && card.updatedAt)
    .map((card) => calculateDaysBetween(card.createdAt!, card.updatedAt!))
    .filter((days) => days >= 0)

  if (cycles.length === 0) return 0
  const sum = cycles.reduce((acc, days) => acc + days, 0)
  return sum / cycles.length
}

export const calculateResponseTime = (cards: Card[]): number => {
  // Assumindo que há um campo de primeira resposta ou podemos calcular
  // Por enquanto, usando a diferença entre criação e primeira atualização
  const responseTimes = cards
    .filter((card) => card.createdAt && card.updatedAt)
    .map((card) => calculateMinutesBetween(card.createdAt!, card.updatedAt!))
    .filter((minutes) => minutes >= 0)

  if (responseTimes.length === 0) return 0
  const sum = responseTimes.reduce((acc, minutes) => acc + minutes, 0)
  return sum / responseTimes.length
}

import { getStepName, getAllPanelSteps } from './stage-mapping'

export const calculateFunnelMetrics = (cards: Card[]): FunnelMetrics[] => {
  console.log('📊 [FunnelMetrics] Calculando métricas do funil...')
  console.log('📊 [FunnelMetrics] Total de cards:', cards.length)
  
  // Obter todas as etapas do painel
  const allSteps = getAllPanelSteps()
  console.log('📊 [FunnelMetrics] Total de etapas do painel:', allSteps.length)
  console.log('📊 [FunnelMetrics] Etapas do painel:', allSteps)
  
  // Log dos cards com seus stepIds
  console.log('📊 [FunnelMetrics] Cards com stepIds:', cards.map(c => ({
    id: c.id,
    title: c.title,
    stepId: c.stepId,
    stepTitle: c.stepTitle
  })))
  
  // Mapear cards por stepId (mais confiável que stepTitle)
  const stageMap = new Map<string, { cards: Card[]; totalValue: number; stepId: string; stepTitle: string }>()

  cards.forEach((card) => {
    // Usar stepId do card para mapear (mais confiável)
    const cardStepId = card.stepId
    if (!cardStepId) {
      console.warn('⚠️ [FunnelMetrics] Card sem stepId:', card.id)
      return
    }
    
    // Buscar o título da etapa usando o stepId
    const stepTitle = card.stepTitle || getStepName(cardStepId) || 'Sem etapa'
    
    const current = stageMap.get(cardStepId) || { 
      cards: [], 
      totalValue: 0, 
      stepId: cardStepId,
      stepTitle: stepTitle
    }
    current.cards.push(card)
    // Usar monetaryAmount se disponível, senão usar value
    current.totalValue += card.monetaryAmount || card.value || 0
    stageMap.set(cardStepId, current)
  })

  console.log('📊 [FunnelMetrics] Etapas com cards (por stepId):', Array.from(stageMap.entries()).map(([id, data]) => ({
    stepId: id,
    stepTitle: data.stepTitle,
    cardsCount: data.cards.length
  })))

  // Criar métricas para TODAS as etapas do painel, mesmo sem cards
  const metrics: FunnelMetrics[] = allSteps.map((step, index) => {
    // Buscar cards pelo stepId (mais confiável)
    const stageData = stageMap.get(step.id)
    
    // Se a etapa tem cards, usar os dados reais
    if (stageData) {
      return {
        stage: step.title,
        leads: stageData.cards.length,
        value: stageData.totalValue,
        averageTime: calculateAverageTimeForStage(stageData.cards),
        conversionRate: 0, // Será calculado depois
      }
    }
    
    // Se a etapa não tem cards, criar métricas zeradas
    return {
      stage: step.title,
      leads: 0,
      value: 0,
      averageTime: 0,
      conversionRate: 0, // Será calculado depois
    }
  })

  // Se não há etapas do painel, usar as etapas que têm cards (fallback)
  if (allSteps.length === 0) {
    console.log('⚠️ [FunnelMetrics] Nenhuma etapa do painel encontrada, usando etapas dos cards')
    const stages = Array.from(stageMap.entries())
      .map(([stage, data]) => ({
        stage,
        leads: data.cards.length,
        value: data.totalValue,
        averageTime: calculateAverageTimeForStage(data.cards),
        conversionRate: 0,
      }))
      .sort((a, b) => b.leads - a.leads)
    
    // Calcular taxa de conversão
    stages.forEach((stage, index) => {
      const previousTotal =
        index > 0
          ? stages
              .slice(0, index)
              .reduce((sum, s) => sum + s.leads, 0)
          : 0
      stage.conversionRate =
        previousTotal > 0
          ? calculateConversionRate(stage.leads, previousTotal)
          : 100
    })
    
    console.log('📊 [FunnelMetrics] Métricas calculadas (fallback):', stages.length)
    return stages
  }

  // Calcular taxa de conversão baseado na ordem das etapas do painel
  let previousTotal = 0
  metrics.forEach((metric, index) => {
    if (index === 0) {
      metric.conversionRate = 100 // Primeira etapa sempre 100%
    } else {
      metric.conversionRate =
        previousTotal > 0
          ? calculateConversionRate(metric.leads, previousTotal)
          : 0
    }
    previousTotal += metric.leads
  })

  console.log('📊 [FunnelMetrics] ✅ Métricas calculadas:', metrics.length, 'etapas')
  console.log('📊 [FunnelMetrics] Métricas:', JSON.stringify(metrics, null, 2))
  
  return metrics
}

const calculateAverageTimeForStage = (cards: Card[]): number => {
  const times = cards
    .filter((card) => card.createdAt && card.updatedAt)
    .map((card) => calculateDaysBetween(card.createdAt!, card.updatedAt!))
    .filter((days) => days >= 0)

  if (times.length === 0) return 0
  const sum = times.reduce((acc, days) => acc + days, 0)
  return sum / times.length
}

export const calculateRevenueMetrics = (
  cards: Card[],
  filters?: DashboardFilters
): RevenueMetrics => {
  const closedCards = cards.filter(
    (card) => card.status === 'closed' || card.status === 'concluido'
  )

  const totalRevenue = closedCards.reduce(
    (sum, card) => sum + (card.value || 0),
    0
  )

  const revenueBySeller: Record<string, number> = {}
  const revenueByChannel: Record<string, number> = {}

  closedCards.forEach((card) => {
    if (card.assignedTo) {
      revenueBySeller[card.assignedTo] =
        (revenueBySeller[card.assignedTo] || 0) + (card.value || 0)
    }
    // Buscar canal do campo customFields['origem-11']
    const origem = card.customFields?.['origem-11']
    if (origem && typeof origem === 'string' && origem.trim()) {
      const channelName = origem.trim()
      revenueByChannel[channelName] =
        (revenueByChannel[channelName] || 0) + (card.value || 0)
    }
  })

  const averageTicket = calculateAverageTicket(totalRevenue, closedCards.length)

  return {
    totalRevenue,
    averageTicket,
    revenueBySeller,
    revenueByChannel,
  }
}

export const calculateConversionMetrics = (
  cards: Card[]
): ConversionMetrics => {
  const totalLeads = cards.length
  const convertedLeads = cards.filter(
    (card) => card.status === 'closed' || card.status === 'concluido'
  ).length

  const overallConversionRate = calculateConversionRate(
    convertedLeads,
    totalLeads
  )
  const averageSalesCycle = calculateSalesCycle(cards)
  const averageResponseTime = calculateResponseTime(cards)

  return {
    overallConversionRate,
    averageSalesCycle,
    averageResponseTime,
  }
}

export const calculateLostValue = (
  cards: Card[]
): { reason: string; value: number; count: number }[] => {
  const lostCards = cards.filter(
    (card) => card.status === 'lost' || card.status === 'perdido'
  )

  const lostByReason = new Map<
    string,
    { value: number; count: number }
  >()

  lostCards.forEach((card) => {
    const reason = card.lostReason || 'Sem motivo'
    const current = lostByReason.get(reason) || { value: 0, count: 0 }
    current.value += card.value || 0
    current.count += 1
    lostByReason.set(reason, current)
  })

  return Array.from(lostByReason.entries())
    .map(([reason, data]) => ({
      reason,
      value: data.value,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value)
}

export const aggregateByPeriod = (
  cards: Card[],
  period: 'day' | 'week' | 'month'
): Record<string, { count: number; value: number }> => {
  const aggregated: Record<
    string,
    { count: number; value: number }
  > = {}

  cards.forEach((card) => {
    if (!card.createdAt) return

    const date = new Date(card.createdAt)
    let key: string

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (!aggregated[key]) {
      aggregated[key] = { count: 0, value: 0 }
    }

    aggregated[key].count += 1
    aggregated[key].value += card.value || 0
  })

  return aggregated
}

export const filterCardsByPeriod = (
  cards: Card[],
  startDate?: string,
  endDate?: string
): Card[] => {
  if (!startDate && !endDate) return cards

  return cards.filter((card) => {
    if (!card.createdAt) return false

    const cardDate = new Date(card.createdAt)

    if (startDate) {
      const start = new Date(startDate)
      if (cardDate < start) return false
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      if (cardDate > end) return false
    }

    return true
  })
}

export const filterCardsByUser = (
  cards: Card[],
  userId?: string
): Card[] => {
  if (!userId) return cards
  // Usar responsibleUserId se disponível, senão usar assignedTo
  return cards.filter((card) => card.responsibleUserId === userId || card.assignedTo === userId)
}

export const filterCardsByChannel = (
  cards: Card[],
  channelId?: string
): Card[] => {
  if (!channelId) return cards
  
  return cards.filter((card) => {
    // Buscar canal do campo customFields['origem-11']
    const origem = card.customFields?.['origem-11']
    if (origem && typeof origem === 'string' && origem.trim()) {
      // Comparar com o ID normalizado
      const cardChannelId = origem.trim().toLowerCase().replace(/\s+/g, '-')
      return cardChannelId === channelId
    }
    return false
  })
}

