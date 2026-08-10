import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, ChartTooltip, chartAxisProps } from '@/components/charts/chart-card'
import { CHART_PALETTE } from '@/config/colors'
import type { PlannedVsActualPoint } from '@/types/dashboard'

export interface PlannedVsActualProps {
  data: PlannedVsActualPoint[]
  loading?: boolean
}

export function PlannedVsActualWidget({ data, loading }: PlannedVsActualProps) {
  return (
    <ChartCard
      title="Planned vs Actual Progress"
      description="Committed points vs points delivered per window"
      legend={[
        { label: 'Planned', color: CHART_PALETTE[1] },
        { label: 'Actual', color: CHART_PALETTE[0] },
      ]}
      loading={loading}
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" {...chartAxisProps} />
            <YAxis {...chartAxisProps} />
            <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
            <Bar dataKey="planned" name="Planned" fill={CHART_PALETTE[1]} radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="actual" name="Actual" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
