import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { uploadCourse } from '../api/courses'
import { ArrowLeft, FileText, Upload as UploadIcon } from 'lucide-react'

export default function Upload() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('text') // 'text' | 'pdf'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('title', form.title)
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
        <div className="flex bg-white/10 rounded-2xl p-1 mb-8">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${
              mode === 'text'
                ? 'bg-violet-600 text-white shadow'
                : 'text-indigo-300 hover:text-white'
            }`}
          >
            <FileText size={16} />
            Copier-coller
          </button>
          <button
            onClick={() => setMode('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${
              mode === 'pdf'
                ? 'bg-violet-600 text-white shadow'
                : 'text-indigo-300 hover:text-white'
            }`}
          >
            <UploadIcon size={16} />
            Upload PDF
          </button>
        </div>

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
              placeholder="Ex: La photosynthèse, Les équations du second degré..."
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
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-4 transition shadow-lg shadow-violet-500/30"
          >
            {loading ? '⏳ Upload en cours...' : '🚀 Uploader et générer avec l\'IA'}
          </button>

        </form>
      </div>
    </div>
  )
}