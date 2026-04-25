function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function MobileControls({
  isPlaying,
  speedLabel,
  loopState,
  loopStart,
  loopEnd,
  onPlayPause,
  onSeekBack,
  onSeekForward,
  onCycleSpeed,
  onAdvanceLoop,
}) {
  const isSlowMode = speedLabel !== '100%'

  const loopBg =
    loopState === 2 ? 'bg-emerald-950' : 'bg-zinc-800'
  const loopBorder =
    loopState === 0 ? 'border-transparent' :
    loopState === 1 ? 'border-amber-400/60' :
    'border-emerald-400/60'
  const loopTextColor =
    loopState === 0 ? 'text-zinc-600' :
    loopState === 1 ? 'text-amber-400' :
    'text-emerald-400'

  return (
    <div className="flex-1 flex flex-col md:hidden bg-zinc-900 p-2 gap-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>

      {/* Row 1 — transport (secondary) */}
      <div className="flex gap-2 h-20">
        <button
          onClick={onSeekBack}
          className="flex-1 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-xs text-zinc-400 uppercase tracking-widest active:bg-zinc-700 active:text-white"
        >
          ← 5S
        </button>
        <button
          onClick={onPlayPause}
          className="flex-1 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-2xl text-white active:bg-zinc-700 active:text-zinc-500"
        >
          {isPlaying ? '⏸\uFE0E' : '▶\uFE0E'}
        </button>
        <button
          onClick={onSeekForward}
          className="flex-1 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-xs text-zinc-400 uppercase tracking-widest active:bg-zinc-700 active:text-white"
        >
          5S →
        </button>
      </div>

      {/* Row 2 — speed */}
      <div className="h-20 bg-zinc-800 rounded-lg">
        <button
          onClick={onCycleSpeed}
          className="w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg active:bg-zinc-700"
        >
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Speed</span>
          <span className={`font-mono text-sm uppercase tracking-widest ${isSlowMode ? 'text-amber-400' : 'text-zinc-400'}`}>
            {speedLabel}
          </span>
        </button>
      </div>

      {/* Row 3 — loop (hero) */}
      <div className={`flex-1 rounded-lg border ${loopBg} ${loopBorder}`}>
        <button
          onClick={onAdvanceLoop}
          className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-lg active:brightness-125"
        >
          {loopState === 0 && (
            <>
              <span className={`font-mono text-sm uppercase tracking-widest ${loopTextColor}`}>Loop</span>
              <span className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Tap to set in point</span>
            </>
          )}
          {loopState === 1 && (
            <>
              <span className={`font-mono text-sm uppercase tracking-widest ${loopTextColor}`}>Loop in set</span>
              <span className={`font-mono text-base ${loopTextColor}`}>
                {formatTime(loopStart)} → ?
              </span>
              <span className="font-mono text-[10px] text-amber-400/50 uppercase tracking-widest">Tap to set out point</span>
            </>
          )}
          {loopState === 2 && (
            <>
              <span className={`font-mono text-sm uppercase tracking-widest ${loopTextColor}`}>Looping</span>
              <span className={`font-mono text-base ${loopTextColor}`}>
                {formatTime(loopStart)} → {formatTime(loopEnd)}
              </span>
              <span className="font-mono text-[10px] text-emerald-400/40 uppercase tracking-widest">Tap to clear</span>
            </>
          )}
        </button>
      </div>

    </div>
  )
}

export default MobileControls
