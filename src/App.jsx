import { useState, useEffect, useRef } from 'react'
import UrlInput from './components/UrlInput.jsx'
import Player from './components/Player.jsx'

function App() {
  const [ytReady, setYtReady] = useState(false)
  const [videoId, setVideoId] = useState('')
  const playerRef = useRef(null)
  const inputRef = useRef(null)

  // Load the YouTube IFrame API script once on mount.
  // The API calls window.onYouTubeIframeAPIReady when it's done loading.
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [])

  function handlePlayerReady(player) {
    playerRef.current = player
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <span className="font-mono text-zinc-400 text-sm tracking-widest">woodshed</span>
        <UrlInput ref={inputRef} onLoad={setVideoId} />
      </header>

      {/* Player */}
      <main className="flex-1">
        {videoId ? (
          <Player
            videoId={videoId}
            ytReady={ytReady}
            onPlayerReady={handlePlayerReady}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-zinc-600 font-mono text-sm">
            paste a YouTube URL above to begin
          </div>
        )}
      </main>
    </div>
  )
}

export default App
