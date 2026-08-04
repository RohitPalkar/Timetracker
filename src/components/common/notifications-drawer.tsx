import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Bell, CheckCheck, ClipboardCheck, MessageSquare, UserPlus } from 'lucide-react'
import { Drawer } from '@/components/common/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/feedback/empty-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { notificationService } from '@/services'
import { formatRelative } from '@/lib/formats'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/types/collaboration'

const ICONS = {
  mention: MessageSquare,
  assignment: UserPlus,
  approval: ClipboardCheck,
  comment: MessageSquare,
  system: Bell,
}

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
    enabled: open,
  })

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const items = notificationsQuery.data ?? []
  const unread = items.filter((item) => !item.read).length

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
              <TabsTrigger value="unread">
                Unread
                {unread > 0 && (
                  <Badge variant="brand" className="ml-1.5 px-1.5 py-0 text-[10px]">
                    {unread}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={unread === 0 || markAllMutation.isPending}
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              Mark all read
            </Button>
          </div>

          {notificationsQuery.isLoading ? (
            <LoadingState className="my-4" />
          ) : (
            <>
              <TabsContent value="all" className="mt-3">
                <NotificationList items={items} />
              </TabsContent>
              <TabsContent value="unread" className="mt-3">
                <NotificationList items={items.filter((item) => !item.read)} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Drawer>
  )
}

function NotificationList({ items }: { items: AppNotification[] }) {
  if (items.length === 0) {
    return <EmptyState compact title="You're all caught up" description="No notifications here." />
  }
  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const Icon = ICONS[item.type]
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
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.body}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground/70">{formatRelative(item.createdAt)}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}