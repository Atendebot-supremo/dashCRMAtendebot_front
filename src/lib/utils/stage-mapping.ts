import type { Card } from '../api/helena-types'

/**
 * Mapeia stepId para nomes das etapas do funil baseado nos dados reais
 * Se stepTitle estiver disponível, usa ele, senão usa mapeamento fixo
 */
export const getStageName = (card: Card): string => {
  // Se tem stepTitle, usa ele
  if (card.stepTitle) {
    return card.stepTitle
  }
  
  // Mapeamento fixo das 6 etapas conhecidas (baseado na imagem do AtendeBot)
  const stageMap: Record<string, string> = {
    // IDs de exemplo - serão atualizados com dados reais
    'em-atendimento': 'Em atendimento',
    'atendimento-humano': 'Atendimento Humano',
    'qualificado': 'Qualificado',
    'orcamento-enviado': 'Orçamento Enviado',
    'perdido': 'Perdido',
    'venda-realizada': 'Venda realizada',
  }
  
  // Tentar encontrar por stepId
  if (card.stepId && stageMap[card.stepId]) {
    return stageMap[card.stepId]
  }
  
  // Se não encontrou, usar stepTitle ou stepId como fallback
  return card.stepTitle || card.stepId || 'Sem etapa'
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

