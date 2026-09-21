import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadCourse } from '../api/courses'
import { FileText, Upload as UploadIcon, Camera, AlertTriangle, X, Plus, File as FileIcon, CloudUpload } from 'lucide-react'
import { getErrorMessage } from '../lib/errors'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import Tabs from '../components/ui/Tabs'
import AIProgress from '../components/ui/AIProgress'

const MODES = [
  { key: 'text', label: 'Texte', icon: FileText },
  { key: 'pdf', label: 'PDF', icon: UploadIcon },
  { key: 'image', label: 'Photo', icon: Camera },
]

const MAX_PHOTOS = 3

const STEPS = {
  text: ['Lecture du cours', 'Préparation des révisions'],
  pdf: ['Lecture du PDF', 'Extraction du texte', 'Préparation des révisions'],
  image: ['Analyse des photos', 'Extraction du texte', 'Préparation des révisions'],
}

export default function Upload() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '' })
  const [file, setFile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('text')

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
  }

  const handleAddPhoto = (e) => {
    const selected = e.target.files[0]
    if (!selected || photos.length >= MAX_PHOTOS) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotos((prev) => [...prev, { file: selected, preview: ev.target.result }])
    }
    reader.readAsDataURL(selected)
    e.target.value = ''
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('upload_type', mode)

      if (mode === 'text') {
        formData.append('content', form.content)
      } else if (mode === 'pdf' && file) {
        formData.append('file', file)
      } else if (mode === 'image') {
        photos.forEach((photo, i) => formData.append(`photo_${i}`, photo.file))
        formData.append('photos_count', photos.length)
      }

      const res = await uploadCourse(formData)
      navigate(`/courses/${res.data.id}`)
    } catch (err) {
      setError(getErrorMessage(err, "Impossible d'importer ce cours. Vérifie le contenu et réessaie."))
      setLoading(false)
    }
  }

  const canSubmit = () => {
    if (loading) return false
    if (mode === 'text') return form.content.trim().length > 0
    if (mode === 'pdf') return !!file
    if (mode === 'image') return photos.length > 0
    return false
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-md mx-auto">
        <Card className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/14 flex items-center justify-center">
            <CloudUpload size={26} className="text-accent" />
          </div>
          <div>
            <h2 className="font-bold">Revio prépare ton cours</h2>
            <p className="text-text-faint text-sm mt-1">Ça prend quelques secondes.</p>
          </div>
          <div className="w-full text-left">
            <AIProgress steps={STEPS[mode]} />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Nouveau cours" backTo="/" />

      <div className="px-4 md:px-8 py-4 max-w-2xl mx-auto space-y-6">
        <Tabs
          tabs={MODES.map((m) => ({ key: m.key, label: m.label, icon: m.icon }))}
          active={mode}
          onChange={(key) => {
            setMode(key)
            setFile(null)
            setPhotos([])
            setError('')
          }}
          className="w-full [&>button]:flex-1"
        />

        {mode === 'image' && (
          <div className="space-y-3">
            <Card className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-accent/14 flex items-center justify-center shrink-0">
                <Camera size={16} className="text-accent" />
              </div>
              <p className="text-sm">
                Jusqu'à <span className="font-bold">{MAX_PHOTOS} photos</span> par cours, uploads illimités.
              </p>
            </Card>
            <Card className="p-4 border-warning/25">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-2">Pour une analyse correcte</p>
                  <ul className="space-y-1">
                    {[
                      'Endroit bien éclairé',
                      'Page entière cadrée, sans la couper',
                      'Évite reflets et ombres',
                      'Une page à la fois',
                    ].map((tip) => (
                      <li key={tip} className="text-text-faint text-xs flex items-center gap-2">
                        <span className="w-1 h-1 bg-text-faint rounded-full shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {error && <Alert tone="danger">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-text-soft mb-2 block">Titre du cours</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : La photosynthèse, Les fonctions dérivées..."
              required
            />
          </div>

          {mode === 'text' && (
            <div>
              <label className="text-sm font-medium text-text-soft mb-2 block">Contenu du cours</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Colle ton cours ici..."
                rows={12}
                required
                className="w-full bg-surface-2 border border-white/15 rounded-xl px-4 py-3 text-sm text-text placeholder-text-faint outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-colors resize-none"
              />
            </div>
          )}

          {mode === 'pdf' && (
            <div>
              <label className="text-sm font-medium text-text-soft mb-2 block">Fichier PDF</label>
              <div
                onClick={() => document.getElementById('pdf-input').click()}
                className="w-full border-2 border-dashed border-white/15 hover:border-accent rounded-xl p-10 text-center cursor-pointer transition-colors"
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileIcon size={28} className="text-accent" />
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-text-faint text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <CloudUpload size={28} className="text-text-faint" />
                    <p className="text-text-soft text-sm">Clique pour choisir un PDF</p>
                    <p className="text-text-faint text-xs">Max 10MB</p>
                  </div>
                )}
              </div>
              <input id="pdf-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {mode === 'image' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-soft">Photos du cours</label>
                <span className="text-text-faint text-xs">{photos.length}/{MAX_PHOTOS}</span>
              </div>

              <div className="space-y-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-white/15">
                    <img src={photo.preview} alt={`Page ${i + 1}`} className="w-full max-h-48 object-contain bg-black/30" />
                    <div className="absolute top-0 left-0 right-0 bg-black/60 px-3 py-1.5 flex items-center justify-between">
                      <span className="text-white text-xs font-medium">Page {i + 1} — {photo.file.name}</span>
                      <button type="button" onClick={() => removePhoto(i)} aria-label="Supprimer la photo" className="text-danger hover:text-danger/80 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {photos.length < MAX_PHOTOS && (
                  <div
                    onClick={() => document.getElementById('image-input').click()}
                    className="w-full border-2 border-dashed border-white/15 hover:border-accent rounded-xl p-8 text-center cursor-pointer transition-colors"
                  >
                    <Plus size={22} className="text-text-faint mx-auto mb-2" />
                    <p className="text-text-soft text-sm">
                      {photos.length === 0 ? 'Clique pour ajouter une photo' : `Ajouter une autre page (${photos.length}/${MAX_PHOTOS})`}
                    </p>
                    <p className="text-text-faint text-xs mt-1">JPG, PNG, WEBP — Max 10MB</p>
                  </div>
                )}

                {photos.length >= MAX_PHOTOS && (
                  <p className="text-text-faint text-xs text-center">Maximum {MAX_PHOTOS} photos atteint pour ce cours.</p>
                )}
              </div>

              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={handleAddPhoto}
              />
            </div>
          )}

          <Button type="submit" disabled={!canSubmit()} className="w-full" size="lg">
            {mode === 'image' && photos.length > 0
              ? `Uploader ${photos.length} photo(s) et générer avec l'IA`
              : "Uploader et générer avec l'IA"}
          </Button>
        </form>
      </div>
    </div>
  )
}
