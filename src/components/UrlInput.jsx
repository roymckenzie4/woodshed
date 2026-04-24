import { useState, forwardRef } from 'react'

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/

function extractVideoId(input) {
  const match = input.match(YT_REGEX)
  return match ? match[1] : null
}

const UrlInput = forwardRef(function UrlInput({ onLoad, defaultValue }, ref) {
  const [value, setValue] = useState(defaultValue || '')
  const [error, setError] = useState(false)

  function submit() {
    const id = extractVideoId(value.trim())
    if (id) {
      setError(false)
      onLoad(id)
    } else {
      setError(true)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') submit()
    if (error) setError(false)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="YouTube URL"
        className={`
          bg-zinc-800 text-white text-sm px-3 py-1.5 rounded w-72
          outline-none border
          ${error ? 'border-red-500' : 'border-zinc-600 focus:border-zinc-400'}
          placeholder:text-zinc-500
        `}
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
