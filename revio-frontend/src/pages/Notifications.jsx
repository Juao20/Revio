import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCheck, BellOff } from 'lucide-react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/auth'
import { getNotifIcon, getNotifTone, timeAgo } from '../lib/notifications'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'

const TONE_BG = {
  accent: 'bg-accent/14 text-accent',
  success: 'bg-success/14 text-success',
  warning: 'bg-warning/14 text-warning',
  danger: 'bg-danger/14 text-danger',
  info: 'bg-info/14 text-info',
  neutral: 'bg-surface-2 text-text-faint',
}

export default function Notifications() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then((r) => r.data),
    refetchInterval: 30000,
  })

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  const notifications = data?.notifications || []
  const unreadCount = data?.unread_count || 0

  return (
    <div>
      <PageHeader
        title="Notifications"
        backTo="/"
        actions={
          unreadCount > 0 && (
            <button
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              <CheckCheck size={14} />
              Tout marquer lu
            </button>
          )
        }
      />

      <div className="px-4 md:px-8 py-4 max-w-2xl mx-auto space-y-2.5">
        {isLoading && (
          <div className="space-y-2.5">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <EmptyState
            icon={BellOff}
            title="Aucune notification"
            description="Tes notifications (streak, niveau, examens débloqués...) apparaîtront ici."
          />
        )}

        {notifications.map((notif) => {
          const Icon = getNotifIcon(notif.type)
          const tone = getNotifTone(notif.type)
          return (
            <Card
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) readMutation.mutate(notif.id)
              }}
              className={`p-4 cursor-pointer transition-colors hover:border-white/20 ${
                !notif.is_read ? 'border-accent/25' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TONE_BG[tone]}`}>
                  <Icon size={17} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`font-semibold text-sm ${notif.is_read ? 'text-text-soft' : 'text-text'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-text-faint text-xs">{timeAgo(notif.created_at)}</span>
                      {!notif.is_read && <span className="w-2 h-2 bg-accent rounded-full" />}
                    </div>
                  </div>
                  <p className="text-text-faint text-sm leading-relaxed">{notif.message}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
