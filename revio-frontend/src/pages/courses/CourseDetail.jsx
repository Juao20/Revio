import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourse, deleteCourse, addPhotoToCourse } from '../../api/courses'
import { generateContent, getFlashcards, getQuizzes, reviewFlashcard, getWeakPoints, askProfessor } from '../../api/study'
import { Zap, Brain, Calendar, Trophy, Trash2, Camera, FileText, Layers, GraduationCap, Target } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import Tabs from '../../components/ui/Tabs'
import Alert from '../../components/ui/Alert'
import AIProgress from '../../components/ui/AIProgress'
import Skeleton from '../../components/ui/Skeleton'
import { getErrorMessage } from '../../lib/errors'
import SummaryTab from './tabs/SummaryTab'
import FlashcardsTab from './tabs/FlashcardsTab'
import ProfessorTab from './tabs/ProfessorTab'
import WeakPointsTab from './tabs/WeakPointsTab'

function masteryTone(score) {
  if (score >= 85) return 'success'
  if (score >= 50) return 'accent'
  return 'warning'
}

const GENERATE_STEPS = ['Lecture du cours', 'Identification des concepts', 'Création du résumé', 'Préparation des révisions']

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('summary')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const { data: course, isLoading, isError, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id).then((r) => r.data),
  })

  const { data: flashcards = [], refetch: refetchFlashcards } = useQuery({
    queryKey: ['flashcards', id],
    queryFn: () => getFlashcards(id).then((r) => r.data),
  })

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => getQuizzes(id).then((r) => r.data),
  })

  const { data: weakPoints } = useQuery({
    queryKey: ['weak-points', id],
    queryFn: () => getWeakPoints(id).then((r) => r.data),
    retry: false,
  })

  const generateMutation = useMutation({
    mutationFn: () => generateContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['course', id])
      queryClient.invalidateQueries(['flashcards', id])
      queryClient.invalidateQueries(['quizzes', id])
      queryClient.invalidateQueries(['profile'])
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({ flashcardId, quality }) => reviewFlashcard(id, flashcardId, quality),
    onSuccess: () => refetchFlashcards(),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      navigate('/courses')
    },
  })

  const addPhotoMutation = useMutation({
    mutationFn: (formData) => addPhotoToCourse(id, formData),
    onSuccess: () => queryClient.invalidateQueries(['course', id]),
    onError: (err) => setPhotoError(getErrorMessage(err, "Impossible d'ajouter cette photo.")),
  })

  const handleAddPhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoError('')
    const formData = new FormData()
    formData.append('file', file)
    addPhotoMutation.mutate(formData)
    e.target.value = ''
  }

  const handleAskProfessor = async (question, history) => {
    const res = await askProfessor(id, question, history)
    queryClient.invalidateQueries(['profile'])
    return res.data.answer
  }

  if (isLoading) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-20" />
        <div className="grid grid-cols-4 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
        <Alert tone="danger">{getErrorMessage(error, 'Impossible de charger ce cours.')}</Alert>
      </div>
    )
  }

  const tabs = [
    { key: 'summary', label: 'Résumé', icon: FileText },
    { key: 'flashcards', label: `Flashcards (${flashcards.length})`, icon: Layers },
    { key: 'professor', label: 'Prof IA', icon: GraduationCap },
    { key: 'weakpoints', label: 'Points faibles', icon: Target },
  ]

  return (
    <div>
      <PageHeader
        title={course.title}
        subtitle={course.course_type || 'Cours'}
        backTo="/courses"
        actions={
          confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-faint">Supprimer définitivement ?</span>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="text-xs font-bold text-danger hover:text-danger/80"
              >
                Confirmer
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-text-faint hover:text-text">
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Supprimer le cours"
              className="w-9 h-9 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center text-text-faint hover:text-danger transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )
        }
      />

      <div className="px-4 md:px-8 py-4 max-w-3xl mx-auto space-y-6">
        {course.mastery_score > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-soft">Maîtrise du cours</span>
              <span className="font-bold">{course.mastery_score}%</span>
            </div>
            <ProgressBar value={course.mastery_score} tone={masteryTone(course.mastery_score)} className="h-2" />
            <p className="text-text-faint text-xs mt-1.5">{course.mastery_label}</p>
          </Card>
        )}

        {course.photos_count > 0 && course.photos_count < 3 && (
          <div className="flex items-center justify-between">
            {photoError && <Alert tone="danger" className="flex-1 mr-3">{photoError}</Alert>}
            <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-hover cursor-pointer transition-colors">
              <Camera size={14} />
              {addPhotoMutation.isPending ? 'Ajout...' : 'Ajouter une photo'}
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAddPhoto} disabled={addPhotoMutation.isPending} />
            </label>
          </div>
        )}

        {generateMutation.isPending ? (
          <Card className="p-6">
            <AIProgress steps={GENERATE_STEPS} />
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => generateMutation.mutate()}
              className="flex flex-col items-center gap-2 bg-accent hover:bg-accent-hover text-bg rounded-2xl py-4 transition-colors font-bold"
            >
              <Zap size={19} />
              <span className="text-xs">Générer l'IA</span>
            </button>
            <button
              onClick={() => navigate(`/courses/${id}/quiz`)}
              className="flex flex-col items-center gap-2 bg-surface-2 hover:bg-surface-3 border border-white/10 rounded-2xl py-4 transition-colors"
            >
              <Brain size={19} className="text-text-soft" />
              <span className="text-xs font-semibold">Quiz ({quizzes.length})</span>
            </button>
            <button
              onClick={() => navigate(`/courses/${id}/plan`)}
              className="flex flex-col items-center gap-2 bg-surface-2 hover:bg-surface-3 border border-white/10 rounded-2xl py-4 transition-colors"
            >
              <Calendar size={19} className="text-text-soft" />
              <span className="text-xs font-semibold">Plan révision</span>
            </button>
            <button
              onClick={() => navigate(`/courses/${id}/exam`)}
              className="flex flex-col items-center gap-2 bg-warning/14 hover:bg-warning/22 rounded-2xl py-4 transition-colors"
            >
              <Trophy size={19} className="text-warning" />
              <span className="text-xs font-semibold text-warning">
                Examen{course.exam_unlocked ? ' — Final débloqué' : ''}
              </span>
            </button>
          </div>
        )}

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="flex-wrap" />

        {activeTab === 'summary' && <SummaryTab course={course} />}
        {activeTab === 'flashcards' && (
          <FlashcardsTab
            flashcards={flashcards}
            onReview={(flashcardId, quality) => reviewMutation.mutate({ flashcardId, quality })}
          />
        )}
        {activeTab === 'professor' && <ProfessorTab courseTitle={course.title} askProfessor={handleAskProfessor} />}
        {activeTab === 'weakpoints' && <WeakPointsTab weakPoints={weakPoints} />}
      </div>
    </div>
  )
}
