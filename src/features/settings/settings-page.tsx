import * as React from 'react'
import { Settings, Palette, Bell, Globe } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/store/auth'
import { toast } from 'sonner'

export function SettingsPage() {
  const { authUser } = useAuth()
  const [weekStart, setWeekStart] = React.useState('1')
  const [timezone, setTimezone] = React.useState('Asia/Kolkata')

  return (
    <PageLayout header={<PageHeader title="Settings" description="Workspace preferences, integrations and billing. Organization settings are scoped to org-acme." breadcrumb={[{ label: 'Settings' }]} />}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="size-4" /> Organization</CardTitle></CardHeader><CardContent className="grid gap-3">
          <div className="grid gap-1.5"><Label>Organization name</Label><Input defaultValue="Acme Digital" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Timezone</Label><Select value={timezone} onValueChange={setTimezone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem><SelectItem value="UTC">UTC</SelectItem><SelectItem value="America/New_York">America/New_York</SelectItem></SelectContent></Select></div>
            <div className="grid gap-1.5"><Label>Week starts on</Label><Select value={weekStart} onValueChange={setWeekStart}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Sunday</SelectItem><SelectItem value="1">Monday</SelectItem></SelectContent></Select></div>
          </div>
          <Button className="w-fit" onClick={()=>toast.success('Organization settings saved (mock)')}>Save</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Palette className="size-4" /> Appearance</CardTitle></CardHeader><CardContent className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2.5"><div><p className="text-sm font-medium text-foreground">Dark mode</p><p className="text-xs text-muted-foreground">Deferred as P3 — tokens are ready.</p></div><Switch disabled /></div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2.5"><span className="text-sm font-medium text-foreground">Compact tables</span><Switch defaultChecked /></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="size-4" /> Notifications</CardTitle></CardHeader><CardContent className="grid gap-3">
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Mentions</span><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Assignment</span><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Approvals</span><Switch defaultChecked /></div>
          <Button variant="outline" className="w-fit" onClick={()=>toast.success('Notification preferences saved')}>Save preferences</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings className="size-4" /> Account</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm"><p className="text-muted-foreground">Signed in as <span className="font-medium text-foreground">{authUser?.name ?? 'Guest'}</span> • {authUser?.email}</p><Button variant="outline" className="w-fit" onClick={()=>toast.info('Profile → /settings/profile')}>Edit profile</Button></CardContent></Card>
      </div>
    </PageLayout>
  )
}
