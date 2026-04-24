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
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="YouTube URL"
        className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded w-72 outline-none border border-zinc-600 focus:border-zinc-400 placeholder:text-zinc-500"
      />
      <button
        onClick={submit}
        className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm px-3 py-1.5 rounded"
      >
        Load
      </button>
    </div>
  )
})

export default UrlInput
