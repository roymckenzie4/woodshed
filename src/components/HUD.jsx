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
    <div className="bg-zinc-800 border-t border-zinc-700 px-4 py-2 font-mono text-sm text-zinc-300 flex gap-6">
      <span>SPEED: {speedLabel}</span>
      <span className={active ? 'text-green-400' : ''}>
        {loopStatus(loopState, loopStart, loopEnd)}
      </span>
    </div>
  )
}

export default HUD
