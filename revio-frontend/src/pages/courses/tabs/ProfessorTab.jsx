import { useState } from 'react'
import { Send, GraduationCap } from 'lucide-react'
import Input from '../../../components/ui/Input'
import { getErrorMessage } from '../../../lib/errors'

const SUGGESTIONS = [
  'Explique-moi le concept principal',
  'Quels sont les points importants ?',
  'Donne-moi un exemple concret',
]

export default function ProfessorTab({ courseTitle, askProfessor }) {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    setLoading(true)
    const newHistory = [...history, { role: 'user', content: question }]
    setHistory(newHistory)

    try {
      const answer = await askProfessor(question, history)
      setHistory([...newHistory, { role: 'assistant', content: answer }])
    } catch (err) {
      setHistory([...newHistory, { role: 'assistant', content: getErrorMessage(err, 'Le Prof IA ne répond pas pour le moment.'), isError: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-380px)] min-h-[420px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {history.length === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-accent/14 flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={26} className="text-accent" />
            </div>
            <p className="font-semibold">Ton Prof IA sur « {courseTitle} »</p>
            <p className="text-text-faint text-sm mt-1">Pose-lui n'importe quelle question sur ce cours.</p>
            <div className="mt-4 space-y-2 max-w-sm mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="block w-full text-left bg-surface hover:bg-surface-2 border border-white/8 text-text-soft text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-bg rounded-br-sm font-medium'
                  : `bg-surface border rounded-bl-sm ${msg.isError ? 'border-danger/30 text-danger' : 'border-white/8 text-text-soft'}`
              }`}
            >
              {msg.role === 'assistant' && !msg.isError && (
                <span className="text-xs text-accent font-semibold block mb-1">Prof IA</span>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-white/8 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-text-faint rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-text-faint rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-text-faint rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Pose ta question au Prof IA..."
          aria-label="Ta question au Prof IA"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label="Envoyer"
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-bg px-4 rounded-xl transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
