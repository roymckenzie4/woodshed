function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function loopStatus(loopState, loopStart, loopEnd) {
  if (loopState === 0) return 'LOOP: —'
  if (loopState === 1) return `LOOP: ${formatTime(loopStart)} → ?`
  return `LOOP: ${formatTime(loopStart)} → ${formatTime(loopEnd)}`
}

function HUD({ speedLabel, loopState, loopStart, loopEnd }) {
  const active = loopState === 2

  return (
    <div className="bg-zinc-800 border-t border-zinc-700 px-4 py-2 font-mono text-xs text-zinc-400 tracking-[0.15em] flex gap-6 items-center">
      <span>SPEED: <span className="text-white">{speedLabel}</span></span>
      <span className={active ? 'text-emerald-400' : ''}>
        {loopStatus(loopState, loopStart, loopEnd)}
      </span>
      <span className="ml-auto">press <span className="text-white">?</span> for controls</span>
    </div>
  )
}

export default HUD
