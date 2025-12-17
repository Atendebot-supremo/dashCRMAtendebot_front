import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string // Formato YYYY-MM-DD (ISO)
  onChange?: (value: string) => void // Retorna YYYY-MM-DD (ISO)
}

/**
 * Componente de input de data com formato brasileiro (DD/MM/YYYY)
 * Internamente trabalha com formato ISO (YYYY-MM-DD) para compatibilidade com APIs
 */
const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Converter de YYYY-MM-DD (ISO) para DD/MM/YYYY (BR) para exibição
    const formatToBR = (isoDate: string): string => {
      if (!isoDate) return ''
      const [year, month, day] = isoDate.split('-')
      return `${day}/${month}/${year}`
    }

    // Converter de DD/MM/YYYY (BR) para YYYY-MM-DD (ISO)
    const formatToISO = (brDate: string): string => {
      // Remove caracteres não numéricos
      const numbers = brDate.replace(/\D/g, '')
      
      if (numbers.length === 0) return ''
      
      // Formata como DD/MM/YYYY enquanto digita
      let formatted = numbers
      if (numbers.length > 2) {
        formatted = `${numbers.slice(0, 2)}/${numbers.slice(2)}`
      }
      if (numbers.length > 4) {
        formatted = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
      }

      // Se tiver 8 dígitos, converter para ISO
      if (numbers.length === 8) {
        const day = numbers.slice(0, 2)
        const month = numbers.slice(2, 4)
        const year = numbers.slice(4, 8)
        
        // Validar data
        const dayNum = parseInt(day, 10)
        const monthNum = parseInt(month, 10)
        const yearNum = parseInt(year, 10)
        
        if (
          dayNum >= 1 && dayNum <= 31 &&
          monthNum >= 1 && monthNum <= 12 &&
          yearNum >= 1900 && yearNum <= 2100
        ) {
          // Retornar ISO para onChange
          return `${year}-${month}-${day}`
        }
      }
      
      return formatted
    }

    const [displayValue, setDisplayValue] = React.useState(() => 
      value ? formatToBR(value) : ''
    )

    // Atualizar display quando value mudar externamente
    React.useEffect(() => {
      if (value) {
        setDisplayValue(formatToBR(value))
      } else {
        setDisplayValue('')
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Se estiver vazio, limpar
      if (inputValue === '') {
        setDisplayValue('')
        onChange?.('')
        return
      }

      // Formatar enquanto digita
      const formatted = formatToISO(inputValue)
      
      // Se for uma data completa válida (8 dígitos), converter para ISO
      if (formatted.length === 10 && formatted.includes('/')) {
        const numbers = formatted.replace(/\D/g, '')
        if (numbers.length === 8) {
          const day = numbers.slice(0, 2)
          const month = numbers.slice(2, 4)
          const year = numbers.slice(4, 8)
          const isoDate = `${year}-${month}-${day}`
          
          // Validar se a data é válida
          const date = new Date(isoDate)
          if (!isNaN(date.getTime())) {
            setDisplayValue(formatted)
            onChange?.(isoDate)
            return
          }
        }
      }
      
      // Atualizar display enquanto digita
      setDisplayValue(formatted)
    }

    const handleBlur = () => {
      // Validar e formatar ao perder o foco
      if (displayValue) {
        const numbers = displayValue.replace(/\D/g, '')
        if (numbers.length === 8) {
          const day = numbers.slice(0, 2)
          const month = numbers.slice(2, 4)
          const year = numbers.slice(4, 8)
          const isoDate = `${year}-${month}-${day}`
          
          const date = new Date(isoDate)
          if (!isNaN(date.getTime())) {
            setDisplayValue(`${day}/${month}/${year}`)
            onChange?.(isoDate)
          } else {
            // Data inválida, limpar
            setDisplayValue('')
            onChange?.('')
          }
        } else if (numbers.length > 0 && numbers.length < 8) {
          // Data incompleta, limpar
          setDisplayValue('')
          onChange?.('')
        }
      }
    }

    return (
      <input
        type="text"
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="DD/MM/AAAA"
        maxLength={10}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)

DateInput.displayName = 'DateInput'

export { DateInput }

