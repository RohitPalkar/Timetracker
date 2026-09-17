import type { ComponentType } from 'react'
import type { DashboardPayload, DashboardWidgetId } from '@/types/dashboard'
import { KpiSummary } from './kpi-summary'
import { PlannedVsActualWidget } from './widgets/planned-vs-actual'
import { TopBugOwnersWidget } from './widgets/top-bug-owners'
import { BudgetConsumptionWidget } from './widgets/budget-consumption'
import { EmployeeHoursWidget } from './widgets/hours-by-employee'
import { ProjectHealthWidget } from './widgets/project-health'
import { SprintTrendWidget } from './widgets/sprint-trend'
import { TimesheetOverviewWidget } from './widgets/timesheet-overview'
import { QualityTrendWidget } from './widgets/quality-trend'
import { OrgActivityWidget } from './widgets/org-activity'

interface WidgetProps {
  data: DashboardPayload
  loading?: boolean
}

export type DashboardWidgetComponent = ComponentType<WidgetProps>

export const DASHBOARD_WIDGET_COMPONENTS: Record<DashboardWidgetId, DashboardWidgetComponent> = {
  kpi: (props) => <KpiSummary kpis={props.data.kpis} loading={props.loading} />,
  'planned-vs-actual': (props) => <PlannedVsActualWidget data={props.data.plannedVsActual} loading={props.loading} />,
  'top-bug-owners': (props) => <TopBugOwnersWidget data={props.data.bugOwners} loading={props.loading} />,
  'budget-consumption': (props) => <BudgetConsumptionWidget data={props.data.budget} loading={props.loading} />,
  'hours-by-employee': (props) => <EmployeeHoursWidget data={props.data.employeeHours} loading={props.loading} />,
  'project-health': (props) => <ProjectHealthWidget data={props.data.projectHealth} loading={props.loading} />,
  'sprint-trend': (props) => <SprintTrendWidget data={props.data.sprintTrend} loading={props.loading} />,
  'timesheet-overview': (props) => <TimesheetOverviewWidget data={props.data.timesheet} loading={props.loading} />,
  'quality-trend': (props) => <QualityTrendWidget data={props.data.qualityTrend} loading={props.loading} />,
  'org-activity': (props) => (
    <OrgActivityWidget risks={props.data.risks} alerts={props.data.alerts} activity={props.data.activity} loading={props.loading} />
  ),
  'action-center': () => null,
  'my-hrms': () => null,
  'my-timesheet': () => null,
  'my-work': () => null,
  'my-team': () => null,
  'management-ops': () => null,
}
