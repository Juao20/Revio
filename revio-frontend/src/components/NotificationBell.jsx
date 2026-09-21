import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, X, Check, BellOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/auth'
import { getNotifIcon, getNotifTone, timeAgo } from '../lib/notifications'

const TONE_BG = {
  accent: 'bg-accent/14 text-accent',
  success: 'bg-success/14 text-success',
  warning: 'bg-warning/14 text-warning',
  danger: 'bg-danger/14 text-danger',
  info: 'bg-info/14 text-info',
  neutral: 'bg-surface-2 text-text-faint',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const queryClient = useQueryClient()

  const { data } = useQuery({
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

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const notifications = data?.notifications || []
  const unreadCount = data?.unread_count || 0

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center text-text-soft hover:text-text transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-surface border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => readAllMutation.mutate()}
                  className="text-accent hover:text-accent-hover text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Check size={12} />
                  Tout lire
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-text-faint hover:text-text transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <BellOff size={24} className="text-text-faint mx-auto mb-2" />
                <p className="text-text-faint text-sm">Aucune notification pour l'instant</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = getNotifIcon(notif.type)
                const tone = getNotifTone(notif.type)
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) readMutation.mutate(notif.id)
                    }}
                    className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-surface-2 ${
                      !notif.is_read ? 'bg-accent/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TONE_BG[tone]}`}>
                        <Icon size={14} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${notif.is_read ? 'text-text-soft' : 'text-text'}`}>
                            {notif.title}
                          </p>
                          {!notif.is_read && <span className="w-2 h-2 bg-accent rounded-full shrink-0" />}
                        </div>
                        <p className="text-text-faint text-xs mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                        <p className="text-text-faint/70 text-xs mt-1">{timeAgo(notif.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/8">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-accent hover:text-accent-hover text-xs font-semibold transition-colors"
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
