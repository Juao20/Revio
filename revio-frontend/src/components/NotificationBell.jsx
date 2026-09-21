import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, X, Check } from 'lucide-react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/auth'
import { Link } from 'react-router-dom'

const NOTIF_ICONS = {
  flashcards_due:  '🃏',
  streak_danger:   '🔥',
  streak_broken:   '💔',
  level_up:        '⭐',
  exam_unlocked:   '🏆',
  welcome:         '👋',
  weak_points:     '🎯',
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return `Il y a ${Math.floor(diff / 86400)}j`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then((r) => r.data),
    refetchInterval: 30000, // rafraîchir toutes les 30 secondes
  })

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  // Fermer si clic en dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const notifications = data?.notifications || []
  const unreadCount = data?.unread_count || 0

  return (
    <div className="relative" ref={ref}>

      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-indigo-400 hover:text-white transition p-1"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-indigo-950/95 backdrop-blur border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => readAllMutation.mutate()}
                  className="text-indigo-400 hover:text-white text-xs flex items-center gap-1 transition"
                >
                  <Check size={12} />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-indigo-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-3xl block mb-2">🔔</span>
                <p className="text-indigo-400 text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) readMutation.mutate(notif.id)
                  }}
                  className={`px-4 py-3 border-b border-white/5 cursor-pointer transition hover:bg-white/5 ${
                    !notif.is_read ? 'bg-violet-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">
                      {NOTIF_ICONS[notif.type] || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${
                          notif.is_read ? 'text-indigo-300' : 'text-white'
                        }`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-violet-400 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-indigo-400 text-xs mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-indigo-600 text-xs mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-violet-400 hover:text-violet-300 text-xs transition"
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