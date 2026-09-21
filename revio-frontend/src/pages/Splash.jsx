export default function Splash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center">
      <div className="text-center animate-fade-in">

        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-violet-500 rounded-3xl mb-6 shadow-2xl shadow-violet-500/40">
          <span className="text-5xl">🎓</span>
        </div>

        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Revio</h1>
        <p className="text-indigo-300 text-lg">Ton coach de révision IA</p>

        {/* Loader */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

      </div>
    </div>
  )
}