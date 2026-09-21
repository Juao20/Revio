import { BookOpen, Flame, HeartCrack, Star, Trophy, PartyPopper, Target, Bell } from 'lucide-react'

export const NOTIF_ICONS = {
  flashcards_due: BookOpen,
  streak_danger: Flame,
  streak_broken: HeartCrack,
  level_up: Star,
  exam_unlocked: Trophy,
  welcome: PartyPopper,
  weak_points: Target,
}

export const NOTIF_TONES = {
  flashcards_due: 'info',
  streak_danger: 'warning',
  streak_broken: 'danger',
  level_up: 'accent',
  exam_unlocked: 'warning',
  welcome: 'accent',
  weak_points: 'danger',
}

export function getNotifIcon(type) {
  return NOTIF_ICONS[type] || Bell
}

export function getNotifTone(type) {
  return NOTIF_TONES[type] || 'neutral'
}

export function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return "À l'instant"
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return `Il y a ${Math.floor(diff / 86400)}j`
}
