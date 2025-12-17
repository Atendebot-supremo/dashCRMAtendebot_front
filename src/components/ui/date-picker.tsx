import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import 'react-day-picker/dist/style.css'

export interface DatePickerProps {
  value?: string // Formato YYYY-MM-DD (ISO)
  onChange?: (value: string) => void // Retorna YYYY-MM-DD (ISO)
  placeholder?: string
  className?: string
  min?: string // Data mínima em formato YYYY-MM-DD
  max?: string // Data máxima em formato YYYY-MM-DD
}

const DatePicker = ({ value, onChange, placeholder = 'Selecione uma data', className, min, max }: DatePickerProps) => {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(undefined)

  // Converter string ISO (YYYY-MM-DD) para Date usando construtor local
  // Isso evita problemas de fuso horário
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return undefined
    // Usar construtor local para evitar problemas de timezone
    const date = new Date(year, month - 1, day)
    return isNaN(date.getTime()) ? undefined : date
  }, [value])

  // Converter Date para string ISO
  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.('')
      return
    }

    // Validar data mínima (usar construtor local)
    if (min) {
      const [minYear, minMonth, minDay] = min.split('-').map(Number)
      if (minYear && minMonth && minDay) {
        const minDate = new Date(minYear, minMonth - 1, minDay)
        // Comparar apenas a data, ignorando hora
        const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        if (selectedDateOnly < minDate) {
          return
        }
      }
    }

    // Validar data máxima (usar construtor local)
    if (max) {
      const [maxYear, maxMonth, maxDay] = max.split('-').map(Number)
      if (maxYear && maxMonth && maxDay) {
        const maxDate = new Date(maxYear, maxMonth - 1, maxDay)
        // Comparar apenas a data, ignorando hora
        const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        if (selectedDateOnly > maxDate) {
          return
        }
      }
    }

    // Formatar para ISO usando os valores locais da data
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const isoDate = `${year}-${month}-${day}`
    onChange?.(isoDate)
    setOpen(false)
  }

  // Converter min e max para Date usando construtor local
  const minDate = React.useMemo(() => {
    if (!min) return undefined
    const [year, month, day] = min.split('-').map(Number)
    if (!year || !month || !day) return undefined
    // Usar construtor local para evitar problemas de timezone
    const date = new Date(year, month - 1, day)
    return isNaN(date.getTime()) ? undefined : date
  }, [min])

  const maxDate = React.useMemo(() => {
    if (!max) return undefined
    const [year, month, day] = max.split('-').map(Number)
    if (!year || !month || !day) return undefined
    // Usar construtor local para evitar problemas de timezone
    const date = new Date(year, month - 1, day)
    return isNaN(date.getTime()) ? undefined : date
  }, [max])

  // Quando o popover abrir, definir o mês para a data selecionada ou mês atual
  React.useEffect(() => {
    if (open) {
      setMonth(selectedDate || new Date())
    }
  }, [open, selectedDate])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full h-10 justify-start text-left font-normal bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-700/70 focus:border-[#c8fa00] focus:ring-[#c8fa00]/20 transition-all',
            !selectedDate && 'text-gray-500',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#c8fa00]" />
          {selectedDate ? (
            format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={ptBR}
          // Controlar o mês exibido - sempre começar no mês da data selecionada ou mês atual
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 p-3',
            caption: 'flex justify-center pt-1 relative items-center mb-4',
            caption_label: 'text-sm font-semibold text-white',
            nav: 'space-x-1 flex items-center',
            nav_button: cn(
              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-gray-700 rounded-md border border-transparent hover:border-gray-600'
            ),
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex mb-2',
            head_cell: 'text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-gray-700/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: cn(
              'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md text-white hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center'
            ),
            day_selected: 'bg-[#c8fa00] text-gray-900 hover:bg-[#c8fa00] hover:text-gray-900 focus:bg-[#c8fa00] focus:text-gray-900 font-semibold',
            day_today: 'bg-gray-700/50 text-white font-semibold',
            day_outside: 'text-gray-500 opacity-50',
            day_disabled: 'text-gray-500 opacity-30 cursor-not-allowed',
            day_range_middle: 'aria-selected:bg-gray-700/50 aria-selected:text-white',
            day_hidden: 'invisible',
          }}
          styles={{
            caption: { paddingBottom: '0.5rem' },
            month: { padding: '0.5rem' },
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }

