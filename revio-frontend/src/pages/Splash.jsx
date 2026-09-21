import { GraduationCap } from 'lucide-react'

export default function Splash() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-sans">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-3xl mb-6 shadow-2xl shadow-accent/30">
          <GraduationCap size={38} className="text-bg" strokeWidth={2} />
        </div>

        <h1 className="text-4xl font-extrabold text-text mb-2 tracking-tight">Revio</h1>
        <p className="text-text-faint text-base">Ton coach de révision IA</p>

        <div className="flex items-center justify-center gap-2 mt-10">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
