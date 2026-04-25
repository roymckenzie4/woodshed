import { forwardRef } from 'react'

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/

export function extractVideoId(input) {
  const match = input.match(YT_REGEX)
  return match ? match[1] : null
}

// UrlInput is fully controlled — App owns the value and passes it down.
// This lets App save the URL to localStorage and restore it on reload.
const UrlInput = forwardRef(function UrlInput({ value, onChange, onLoad }, ref) {
  function submit() {
    const id = extractVideoId(value.trim())
    if (id) onLoad(id)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="YouTube URL"
        className="font-mono bg-zinc-800 text-white text-xs px-3 py-1.5 rounded flex-1 min-w-0 outline-none border border-zinc-700 focus:border-zinc-500 placeholder:text-zinc-600 tracking-wide"
      />
      <button
        onClick={submit}
        className="font-mono text-xs text-zinc-500 hover:text-white uppercase tracking-[0.15em] transition-colors pl-1"
      >
        Load
      </button>
    </div>
  )
})

export default UrlInput
