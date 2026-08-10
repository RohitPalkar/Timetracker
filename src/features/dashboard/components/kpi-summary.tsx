import { Building2, FolderKanban, Gauge, Layers, Users } from 'lucide-react'
import { MetricCard } from '@/components/common/metric-card'
import type { DashboardKpi } from '@/types/dashboard'

const KPI_ICONS = [FolderKanban, Layers, Users, Building2, Gauge] as const
const KPI_TONES = ['brand', 'info', 'success', 'warning', 'neutral'] as const

export interface KpiSummaryProps {
  kpis: DashboardKpi[]
  loading?: boolean
}

export function KpiSummary({ kpis, loading }: KpiSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi, index) => (
        <MetricCard
          key={kpi.id}
          title={kpi.label}
          value={kpi.value}
          icon={KPI_ICONS[index % KPI_ICONS.length]}
          iconTone={KPI_TONES[index % KPI_TONES.length]}
          trend={kpi.trend}
          trendLabel={kpi.trendLabel}
          hint={kpi.hint}
          loading={loading}
        />
      ))}
    </div>
  )
}
