const SHORTCUTS = [
  ['spc',   'play / pause'],
  ['← →',   'seek ±5s'],
  ['s',     'cycle speed'],
  ['l',     'set loop start → end → clear'],
  ['[ ]',   'nudge loop start ±0.25s'],
  ['{ }',   'nudge loop end ±0.25s'],
  ['?',     'close'],
]

function Cheatsheet({ onClose }) {
  return (
    // Clicking the backdrop closes the overlay
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded px-10 py-8 font-mono"
        onClick={e => e.stopPropagation()} // don't close when clicking the card itself
      >
        <div className="text-xs text-white tracking-[0.25em] uppercase mb-3">
          keyboard shortcuts
        </div>
        <div className="h-px bg-zinc-700 mb-4" />
        <div className="flex flex-col gap-2.5">
          {SHORTCUTS.map(([key, desc]) => (
            <div key={key} className="flex gap-8">
              <span className="text-white text-xs w-10 shrink-0">{key}</span>
              <span className="text-zinc-400 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Cheatsheet
