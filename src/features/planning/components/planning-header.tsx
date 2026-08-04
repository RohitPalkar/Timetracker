import { PageHeader } from '@/components/common/page-header'
import type { BreadcrumbItem } from '@/components/navigation/breadcrumb'
import type { ReactNode } from 'react'

export interface PlanningHeaderProps {
  title: string
  description?: string
  breadcrumb?: BreadcrumbItem[]
  actions?: ReactNode
  eyebrow?: ReactNode
}

/** Planning page header — breadcrumb, title and actions above the layout toolbar. */
export function PlanningHeader({ title, description, breadcrumb, actions, eyebrow }: PlanningHeaderProps) {
  return <PageHeader title={title} description={description} breadcrumb={breadcrumb} actions={actions} eyebrow={eyebrow} />
}
