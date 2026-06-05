import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { uploadCourse } from '../api/courses'
import { ArrowLeft, FileText, Upload as UploadIcon, Camera, AlertTriangle, X, Plus } from 'lucide-react'
import useAuthStore from '../stores/authStore'

const MODES = [
  { key: 'text',  label: 'Texte',  icon: FileText,   desc: 'Copier-coller ton cours' },
  { key: 'pdf',   label: 'PDF',    icon: UploadIcon, desc: 'Upload un fichier PDF' },
  { key: 'image', label: 'Photo',  icon: Camera,     desc: 'Photo de tes notes' },
]

export default function Upload() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [form, setForm] = useState({ title: '', content: '' })
  const [file, setFile] = useState(null)           // pour PDF
  const [photos, setPhotos] = useState([])          // liste de photos { file, preview }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('text')

  const maxPhotos = user?.is_premium ? 3 : 1

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
  }

  const handleAddPhoto = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    if (photos.length >= maxPhotos) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotos((prev) => [...prev, { file: selected, preview: ev.target.result }])
    }
    reader.readAsDataURL(selected)

    // Reset l'input pour pouvoir re-sélectionner le même fichier
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
        // Envoyer toutes les photos
        photos.forEach((photo, i) => {
          formData.append(`photo_${i}`, photo.file)
        })
        formData.append('photos_count', photos.length)
      }

      const res = await uploadCourse(formData)
      navigate(`/courses/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'upload')
    } finally {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-indigo-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-white font-bold text-lg">Nouveau cours</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Toggle mode */}
        <div className="flex bg-white/10 rounded-2xl p-1 mb-8 gap-1">
          {MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setMode(key)
                setFile(null)
                setPhotos([])
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${
                mode === key
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-indigo-300 hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Infos + Warning photo */}
        {mode === 'image' && (
          <div className="space-y-3 mb-6">

            {/* Limites */}
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl px-5 py-4">
              <p className="text-violet-300 font-semibold text-sm mb-3">📸 Photos par cours</p>
              {user?.is_premium ? (
                <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="text-yellow-300 font-semibold text-sm">Tu es Premium !</p>
                    <p className="text-yellow-400 text-xs">Jusqu'à 3 photos par cours — uploads illimités</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-white font-bold text-lg">1</p>
                      <p className="text-indigo-400 text-xs">photo max gratuit</p>
                      <p className="text-indigo-500 text-xs">1 upload/jour</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                      <p className="text-yellow-300 font-bold text-lg">3</p>
                      <p className="text-yellow-400 text-xs">photos max Premium</p>
                      <p className="text-yellow-500 text-xs">uploads illimités</p>
                    </div>
                  </div>
                  <Link
                    to="/premium"
                    className="block text-center text-violet-400 hover:text-violet-300 text-xs mt-3 underline"
                  >
                    Passer en Premium pour ajouter jusqu'à 3 photos →
                  </Link>
                </>
              )}
            </div>

            {/* Conseils qualité */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-semibold text-sm mb-2">
                    Pour une analyse correcte :
                  </p>
                  <ul className="space-y-1">
                    {[
                      'Prends la photo dans un endroit bien éclairé',
                      'Cadre bien la page entière sans la couper',
                      'Évite les reflets et les ombres sur le document',
                      'Tiens ton téléphone stable et bien droit',
                      'Assure-toi que le texte est net et lisible',
                      'Une page à la fois pour un meilleur résultat',
                    ].map((tip, i) => (
                      <li key={i} className="text-yellow-200 text-xs flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Titre */}
          <div>
            <label className="text-indigo-200 text-sm font-medium mb-2 block">
              Titre du cours
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              placeholder="Ex: La photosynthèse, Les fonctions mathématiques..."
              required
            />
          </div>

          {/* Contenu texte */}
          {mode === 'text' && (
            <div>
              <label className="text-indigo-200 text-sm font-medium mb-2 block">
                Contenu du cours
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                placeholder="Colle ton cours ici..."
                rows={12}
                required
              />
            </div>
          )}

          {/* Upload PDF */}
          {mode === 'pdf' && (
            <div>
              <label className="text-indigo-200 text-sm font-medium mb-2 block">
                Fichier PDF
              </label>
              <div
                onClick={() => document.getElementById('pdf-input').click()}
                className="w-full border-2 border-dashed border-white/20 hover:border-violet-500 rounded-xl p-10 text-center cursor-pointer transition"
              >
                {file ? (
                  <div>
                    <span className="text-4xl block mb-2">📄</span>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-indigo-400 text-sm mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl block mb-2">☁️</span>
                    <p className="text-indigo-300">Clique pour choisir un PDF</p>
                    <p className="text-indigo-400 text-sm mt-1">Max 10MB</p>
                  </div>
                )}
              </div>
              <input
                id="pdf-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Upload Photos */}
          {mode === 'image' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-indigo-200 text-sm font-medium">
                  Photos du cours
                </label>
                <span className="text-indigo-400 text-xs">
                  {photos.length}/{maxPhotos} photo{maxPhotos > 1 ? 's' : ''}
                </span>
              </div>

              {/* Grille des photos ajoutées */}
              <div className="space-y-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-white/20">
                    <img
                      src={photo.preview}
                      alt={`Page ${i + 1}`}
                      className="w-full max-h-48 object-contain bg-black/20"
                    />
                    <div className="absolute top-0 left-0 right-0 bg-black/50 px-3 py-1.5 flex items-center justify-between">
                      <span className="text-white text-xs font-medium">
                        Page {i + 1} — {photo.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Bouton ajouter photo */}
                {photos.length < maxPhotos && (
                  <div
                    onClick={() => document.getElementById('image-input').click()}
                    className="w-full border-2 border-dashed border-white/20 hover:border-violet-500 rounded-xl p-8 text-center cursor-pointer transition"
                  >
                    <Plus size={24} className="text-indigo-400 mx-auto mb-2" />
                    <p className="text-indigo-300 text-sm">
                      {photos.length === 0
                        ? 'Clique pour ajouter une photo'
                        : `Ajouter une autre page (${photos.length}/${maxPhotos})`
                      }
                    </p>
                    <p className="text-indigo-500 text-xs mt-1">JPG, PNG, WEBP — Max 10MB</p>
                  </div>
                )}

                {/* Message max atteint */}
                {photos.length >= maxPhotos && !user?.is_premium && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                    <p className="text-yellow-300 text-xs">
                      Maximum 1 photo en gratuit.{' '}
                      <Link to="/premium" className="underline hover:text-yellow-200">
                        Passe en Premium
                      </Link>
                      {' '}pour ajouter jusqu'à 3 photos.
                    </p>
                  </div>
                )}

                {photos.length >= maxPhotos && user?.is_premium && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <p className="text-indigo-400 text-xs">
                      Maximum 3 photos atteint pour ce cours.
                    </p>
                  </div>
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

          <button
            type="submit"
            disabled={!canSubmit()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-4 transition shadow-lg shadow-violet-500/30"
          >
            {loading
              ? mode === 'image'
                ? `🔍 Analyse de ${photos.length} photo(s) en cours...`
                : '⏳ Upload en cours...'
              : mode === 'image' && photos.length > 0
                ? `🚀 Uploader ${photos.length} photo(s) et générer avec l'IA`
                : '🚀 Uploader et générer avec l\'IA'
            }
          </button>

        </form>
      </div>
    </div>
  )
}