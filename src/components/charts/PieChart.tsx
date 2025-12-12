import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
}

const PieChart = ({ data, height = 300 }: PieChartProps) => {
  const colors = [
    '#c8fa00',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#ec4899',
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={{ stroke: '#6b7280' }}
          label={({ name, percent }) => (
            `${name}: ${(percent * 100).toFixed(0)}%`
          )}
          outerRadius={100}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          stroke="#1f2937"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
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
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export default PieChart
