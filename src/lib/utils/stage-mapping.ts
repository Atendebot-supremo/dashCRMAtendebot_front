import type { Card } from '../api/helena-types'

// Mapeamento dinâmico de stepId para nome
// Será atualizado quando buscarmos informações do painel
let stepIdToNameMap: Record<string, string> = {}

/**
 * Atualiza o mapeamento de stepId para nome
 */
export const updateStepMapping = (steps: Array<{ id: string; title: string }>) => {
  steps.forEach((step) => {
    stepIdToNameMap[step.id] = step.title
  })
  console.log('📋 [StageMapping] Mapeamento de etapas atualizado:', stepIdToNameMap)
}

/**
 * Mapeia stepId para nome da etapa baseado nos dados reais
 */
export const getStepName = (stepId: string): string => {
  // Tentar buscar no mapeamento dinâmico
  if (stepIdToNameMap[stepId]) {
    return stepIdToNameMap[stepId]
  }
  
  // Fallback: retornar um nome mais amigável baseado no ID
  return `Etapa ${stepId.substring(0, 8)}...`
}

/**
 * Mapeia stepId de um card para nome da etapa
 * Prioridade: stepTitle do card > mapeamento dinâmico > ID encurtado
 */
export const getStageName = (card: Card): string => {
  // Se tem stepTitle no card, usa ele
  if (card.stepTitle) {
    return card.stepTitle
  }
  
  // Usar mapeamento dinâmico
  return getStepName(card.stepId)
}

/**
 * Ordem das etapas do funil (da primeira para a última)
 */
export const STAGE_ORDER = [
  'Em atendimento',
  'Atendimento Humano',
  'Qualificado',
  'Orçamento Enviado',
  'Perdido',
  'Venda realizada',
]

/**
 * Ordena etapas na ordem correta do funil
 */
export const sortStagesByOrder = (stages: string[]): string[] => {
  return stages.sort((a, b) => {
    const indexA = STAGE_ORDER.indexOf(a)
    const indexB = STAGE_ORDER.indexOf(b)
    
    // Se não encontrou na ordem, coloca no final
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    
    return indexA - indexB
  })
}

/**
 * Extrai responsáveis únicos dos cards
 */
export const extractUniqueResponsibles = (cards: Card[]): Array<{ id: string; name: string }> => {
  const responsibleMap = new Map<string, string>()
  
  cards.forEach((card) => {
    if (card.responsibleUserId) {
      // Se não tem nome, usar ID como fallback
      const name = card.responsibleUser?.name || `Vendedor ${card.responsibleUserId.slice(0, 8)}`
      responsibleMap.set(card.responsibleUserId, name)
    }
  })
  
  return Array.from(responsibleMap.entries()).map(([id, name]) => ({
    id,
    name,
  }))
}

/**
 * Extrai canais únicos dos cards ou retorna lista fixa
 */
export const extractUniqueChannels = (cards: Card[]): Array<{ id: string; name: string }> => {
  // Lista fixa de canais (Meta, Google, WhatsApp)
  const fixedChannels = [
    { id: 'meta', name: 'Meta' },
    { id: 'google', name: 'Google' },
    { id: 'whatsapp', name: 'WhatsApp' },
  ]
  
  // Tentar extrair canais dos cards
  const channelMap = new Map<string, string>()
  
  cards.forEach((card) => {
    if (card.channel) {
      channelMap.set(card.channel, card.channel)
    }
  })
  
  // Se encontrou canais nos cards, usar eles
  if (channelMap.size > 0) {
    return Array.from(channelMap.entries()).map(([id, name]) => ({
      id,
      name,
    }))
  }
  
  // Senão, usar lista fixa
  return fixedChannels
}

