import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineChartProps {
  data: Array<Record<string, string | number>>
  dataKey: string
  lines: Array<{
    key: string
    name: string
    color?: string
  }>
  xAxisKey?: string
  height?: number
}

const LineChart = ({
  data,
  dataKey,
  lines,
  xAxisKey = 'name',
  height = 300,
}: LineChartProps) => {
  console.log('📈 [LineChart] Dados recebidos:', data)
  console.log('📈 [LineChart] xAxisKey:', xAxisKey)
  console.log('📈 [LineChart] lines:', lines)
  
  const colors = [
    '#c8fa00',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#f59e0b',
  ]

  if (!data || data.length === 0) {
    console.warn('⚠️ [LineChart] Nenhum dado fornecido')
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#4b5563' }}
          tickLine={{ stroke: '#4b5563' }}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#4b5563' }}
          tickLine={{ stroke: '#4b5563' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
          labelStyle={{ color: '#f9fafb', fontWeight: 600 }}
          itemStyle={{ color: '#d1d5db' }}
        />
        <Legend 
          wrapperStyle={{ color: '#9ca3af' }}
          formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
        />
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color || colors[index % colors.length]}
            strokeWidth={3}
            dot={{ r: 4, fill: line.color || colors[index % colors.length], strokeWidth: 0 }}
            activeDot={{ r: 6, fill: line.color || colors[index % colors.length], stroke: '#fff', strokeWidth: 2 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export default LineChart
