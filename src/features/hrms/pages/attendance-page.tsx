import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock3, LogIn, LogOut } from 'lucide-react'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'
import { toast } from 'sonner'

export function AttendancePage() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const query = useDashboard(persona, filters)
  const att = query.data?.myHRMS.attendance

  return (
    <PageLayout header={<PageHeader title="Attendance" description="Was the employee present? Distinct from timesheets (what work was performed)." breadcrumb={[{ label: 'HRMS' }, { label: 'Attendance' }]} />}>
      <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="size-4" /> Today</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {!att ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <>
                <div className="flex items-center gap-2"><Badge variant={att.status === 'present' ? 'success' : att.status === 'holiday' ? 'info' : 'neutral'} className="capitalize">{att.status.replace('_', ' ')}</Badge>{att.checkIn && <span className="text-xs text-muted-foreground">In {att.checkIn}</span>}{att.checkOut && <span className="text-xs text-muted-foreground">Out {att.checkOut}</span>}</div>
                {att.workingMinutes !== undefined && (
                  <>
                    <p className="text-2xl font-semibold">{Math.floor(att.workingMinutes / 60)}h {att.workingMinutes % 60}m</p>
                    <Progress value={Math.min(100, (att.workingMinutes / 480) * 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target 8h</p>
                  </>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="h-8" disabled={att.status === 'present'} onClick={() => toast.success('Check-in recorded. POST /api/v1/attendance/check-in')}><LogIn className="size-4" /> Check In</Button>
                  <Button size="sm" variant="outline" className="h-8" disabled={att.status !== 'present'} onClick={() => toast.success('Check-out recorded. POST /api/v1/attendance/check-out')}><LogOut className="size-4" /> Check Out</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-sm">Week</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Mon — Present 09:32–18:41 (8h 24m) <br />Tue — Present 09:18–18:05 <br />Wed — Holiday <br />Thu — Present (today) <br />Shows exception where applicable, uses employee holiday calendar.</CardContent></Card>
      </div>
    </PageLayout>
  )
}
