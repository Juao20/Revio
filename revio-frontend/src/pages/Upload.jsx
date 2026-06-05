import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { uploadCourse } from '../api/courses'
import { ArrowLeft, FileText, Upload as UploadIcon, Camera, AlertTriangle } from 'lucide-react'

const MODES = [
  { key: 'text',  label: 'Texte',    icon: FileText,     desc: 'Copier-coller ton cours' },
  { key: 'pdf',   label: 'PDF',      icon: UploadIcon,   desc: 'Upload un fichier PDF' },
  { key: 'image', label: 'Photo',    icon: Camera,       desc: 'Photo de tes notes' },
]

export default function Upload() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('text')

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)

    if (mode === 'image') {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(selected)
    } else {
      setPreview(null)
    }
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
      } else if (file) {
        formData.append('file', file)
      }

      const res = await uploadCourse(formData)
      navigate(`/courses/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      {/* Navbar */}
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
              onClick={() => { setMode(key); setFile(null); setPreview(null) }}
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

        {/* Warning photo */}
        {mode === 'image' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-semibold text-sm mb-1">
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

          {/* Upload Image */}
          {mode === 'image' && (
            <div>
              <label className="text-indigo-200 text-sm font-medium mb-2 block">
                Photo du cours
              </label>
              <div
                onClick={() => document.getElementById('image-input').click()}
                className="w-full border-2 border-dashed border-white/20 hover:border-violet-500 rounded-xl overflow-hidden cursor-pointer transition"
              >
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Aperçu"
                      className="w-full max-h-72 object-contain bg-black/20"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2 flex items-center justify-between">
                      <p className="text-white text-sm">{file.name}</p>
                      <p className="text-indigo-300 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <span className="text-4xl block mb-2">📸</span>
                    <p className="text-indigo-300">Clique pour prendre ou choisir une photo</p>
                    <p className="text-indigo-400 text-sm mt-1">JPG, PNG, WEBP — Max 10MB</p>
                  </div>
                )}
              </div>
              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Changer la photo */}
              {preview && (
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null) }}
                  className="mt-2 text-indigo-400 hover:text-white text-sm transition"
                >
                  Changer la photo
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode !== 'text' && !file)}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-4 transition shadow-lg shadow-violet-500/30"
          >
            {loading
              ? mode === 'image'
                ? '🔍 Analyse de la photo en cours...'
                : '⏳ Upload en cours...'
              : '🚀 Uploader et générer avec l\'IA'
            }
          </button>

        </form>
      </div>
    </div>
  )
}