import * as React from 'react'
import { UserCog, Mail, Building2, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/store/auth'
import { toast } from 'sonner'
import { formatDate } from '@/lib/formats'

export function ProfileSettingsPage() {
  const { authUser } = useAuth()
  const [name, setName] = React.useState(authUser?.name ?? '')
  const [email, setEmail] = React.useState(authUser?.email ?? '')

  React.useEffect(() => { setName(authUser?.name ?? ''); setEmail(authUser?.email ?? '') }, [authUser])

  return (
    <PageLayout header={<PageHeader title="Profile" description="Your account details and preferences." breadcrumb={[{ label: 'Settings', to: '/settings' }, { label: 'Profile' }]} />}>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-3">
            <Avatar className="size-20"><AvatarFallback className="bg-primary-soft text-brand-700 text-xl">{(authUser?.name ?? 'G').slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
            <p className="text-base font-semibold text-foreground">{authUser?.name ?? 'Guest'}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="size-3.5" />{authUser?.email ?? '—'}</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              <Badge variant="neutral" className="gap-1"><Building2 className="size-3" />{authUser?.designation ?? '—'}</Badge>
              <Badge variant="outline" className="gap-1"><MapPin className="size-3" />{authUser ? 'Acme' : '—'}</Badge>
            </div>
            <Badge variant="success">{authUser ? 'Active' : 'Guest'}</Badge>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><UserCog className="size-4" /> Personal information</CardTitle></CardHeader><CardContent className="grid gap-3">
            <div className="grid gap-1.5"><Label>Name</Label><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" /></div>
            <div className="grid gap-1.5"><Label>Email</Label><Input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@acme.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Department</Label><Input defaultValue={authUser?.designation ?? ''} placeholder="Engineering" /></div>
              <div className="grid gap-1.5"><Label>Location</Label><Input defaultValue="Bengaluru" /></div>
            </div>
            <Button className="w-fit" onClick={()=>toast.success('Profile saved (mock)')}>Save changes</Button>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">Security</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm text-muted-foreground"><p>Authentication is via Supabase Auth • OTP flow • Session is persisted via authService.</p><p>Last activity: {formatDate(new Date().toISOString())}</p><Button variant="outline" className="w-fit" onClick={()=>toast.info('Password reset — wires to Supabase Auth recovery.')}>Reset password</Button></CardContent></Card>
        </div>
      </div>
    </PageLayout>
  )
}
