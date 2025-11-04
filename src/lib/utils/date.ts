import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: ptBR })
  } catch {
    return ''
  }
}

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = formatDate(startDate, 'dd/MM/yyyy')
  const end = formatDate(endDate, 'dd/MM/yyyy')
  return `${start} - ${end}`
}

export const calculateDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    return differenceInDays(end, start)
  } catch {
    return 0
  }
}

export const calculateHoursBetween = (startDate: string | Date, endDate: string | Date): number => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    return differenceInHours(end, start)
  } catch {
    return 0
  }
}

export const calculateMinutesBetween = (startDate: string | Date, endDate: string | Date): number => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    return differenceInMinutes(end, start)
  } catch {
    return 0
  }
}

export const getStartOfPeriod = (period: 'today' | 'week' | 'month' | 'year'): Date => {
  const now = new Date()
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':
      const day = now.getDay()
      const diff = now.getDate() - day
      return new Date(now.getFullYear(), now.getMonth(), diff)
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'year':
      return new Date(now.getFullYear(), 0, 1)
    default:
      return now
  }
}

export const getEndOfPeriod = (period: 'today' | 'week' | 'month' | 'year'): Date => {
  const now = new Date()
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    case 'week':
      const day = now.getDay()
      const diff = now.getDate() - day + 6
      return new Date(now.getFullYear(), now.getMonth(), diff, 23, 59, 59)
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    case 'year':
      return new Date(now.getFullYear(), 11, 31, 23, 59, 59)
    default:
      return now
  }
}

export const formatPeriod = (period: 'today' | 'week' | 'month' | 'year'): string => {
  const translations = {
    today: 'Hoje',
    week: 'Esta Semana',
    month: 'Este Mês',
    year: 'Este Ano',
  }
  return translations[period]
}

