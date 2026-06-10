import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCheck } from 'lucide-react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/auth'

const NOTIF_ICONS = {
  flashcards_due:  '🃏',
  streak_danger:   '🔥',
  streak_broken:   '💔',
  level_up:        '⭐',
  exam_unlocked:   '🏆',
  welcome:         '👋',
  premium_active:  '✨',
  weak_points:     '🎯',
}

const NOTIF_COLORS = {
  flashcards_due:  'border-blue-500/20 bg-blue-500/5',
  streak_danger:   'border-orange-500/20 bg-orange-500/5',
  streak_broken:   'border-red-500/20 bg-red-500/5',
  level_up:        'border-yellow-500/20 bg-yellow-500/5',
  exam_unlocked:   'border-yellow-500/20 bg-yellow-500/5',
  welcome:         'border-violet-500/20 bg-violet-500/5',
  premium_active:  'border-yellow-500/20 bg-yellow-500/5',
  weak_points:     'border-red-500/20 bg-red-500/5',
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

export default function Notifications() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then((r) => r.data),
    refetchInterval: 30000,
    enabled: !!localStorage.getItem('token'), // ← ajoute ça
    retry: false,
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
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-indigo-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-white font-bold text-lg">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            className="flex items-center gap-2 text-indigo-400 hover:text-white text-sm transition"
          >
            <CheckCheck size={16} />
            Tout marquer lu
          </button>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-indigo-300">Chargement...</p>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-5xl block mb-4">🔔</span>
            <p className="text-indigo-300 font-medium">Aucune notification</p>
            <p className="text-indigo-500 text-sm mt-1">
              Tes notifications apparaîtront ici
            </p>
          </div>
        )}

        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => { if (!notif.is_read) readMutation.mutate(notif.id) }}
              className={`border rounded-2xl p-5 cursor-pointer transition hover:bg-white/5 ${
                notif.is_read
                  ? 'border-white/10 bg-white/5'
                  : NOTIF_COLORS[notif.type] || 'border-violet-500/20 bg-violet-500/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 text-xl">
                  {NOTIF_ICONS[notif.type] || '🔔'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`font-semibold text-sm ${
                      notif.is_read ? 'text-indigo-300' : 'text-white'
                    }`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-indigo-500 text-xs">
                        {timeAgo(notif.created_at)}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-violet-400 rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-indigo-300 text-sm leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}