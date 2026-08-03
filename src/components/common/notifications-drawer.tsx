import * as React from 'react'
import { Bell, CheckCheck, GitPullRequestArrow, MessageSquare, Rocket } from 'lucide-react'
import { Drawer } from '@/components/common/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/feedback/empty-state'
import { formatRelative } from '@/lib/formats'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  kind: 'mention' | 'review' | 'release' | 'system'
  title: string
  description: string
  time: string
  read: boolean
}

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    kind: 'mention',
    title: 'Aditi mentioned you',
    description: 'in ST-104 “Empty state for boards”',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    kind: 'review',
    title: 'PR awaiting review',
    description: '“Reports export” · by Arjun Mehta',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    kind: 'release',
    title: 'Release 2.4.0 shipped',
    description: 'Deployed to production at 09:41',
    time: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'n4',
    kind: 'system',
    title: 'Sprint planning invite',
    description: 'Sprint 14 planning · tomorrow 10:00',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
]

const ICONS = {
  mention: MessageSquare,
  review: GitPullRequestArrow,
  release: Rocket,
  system: Bell,
}

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [items, setItems] = React.useState<NotificationItem[]>(DEMO_NOTIFICATIONS)
  const unread = items.filter((item) => !item.read).length

  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, read: true })))

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Notifications"
      description={`${unread} unread`}
      variant="large"
      hideHeader={false}
      footer={null}
      primaryLabel=""
    >
      <div className="mb-4 flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread {unread > 0 && <Badge variant="brand" className="ml-1.5 px-1.5 py-0 text-[10px]">{unread}</Badge>}</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0}>
              <CheckCheck className="size-4" aria-hidden="true" />
              Mark all read
            </Button>
          </div>

          <TabsContent value="all" className="mt-3">
            <NotificationList items={items} />
          </TabsContent>
          <TabsContent value="unread" className="mt-3">
            <NotificationList items={items.filter((item) => !item.read)} />
          </TabsContent>
        </Tabs>
      </div>
    </Drawer>
  )
}

function NotificationList({ items }: { items: NotificationItem[] }) {
  if (items.length === 0) {
    return <EmptyState compact title="You're all caught up" description="No notifications here." />
  }
  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const Icon = ICONS[item.kind]
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              'flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring-focus',
              !item.read && 'bg-primary-soft/40',
            )}
          >
            <Avatar className="size-9">
              <AvatarFallback className="text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-[13px] font-medium text-foreground">{item.title}</span>
                {!item.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground/70">{formatRelative(item.time)}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}