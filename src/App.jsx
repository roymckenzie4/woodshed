import { useState, useEffect, useRef } from 'react'
import UrlInput from './components/UrlInput.jsx'
import Player from './components/Player.jsx'

const SPEEDS = [1.0, 0.75, 0.5, 0.35, 0.2]
const SPEED_LABELS = ['100%', '75%', '50%', '35%', '20%']

function App() {
  const [ytReady, setYtReady] = useState(false)
  const [videoId, setVideoId] = useState('')
  const [speedIndex, setSpeedIndex] = useState(0)
  const playerRef = useRef(null)
  const inputRef = useRef(null)

  // Load the YouTube IFrame API script once on mount
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [])

  // Keyboard handler — re-registers when speedIndex changes so it always
  // sees the latest value rather than a stale closure
  useEffect(() => {
    function handleKey(e) {
      // Don't fire shortcuts when the user is typing in the URL input
      if (document.activeElement === inputRef.current) return
      const player = playerRef.current
      if (!player) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
            player.pauseVideo()
          } else {
            player.playVideo()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          player.seekTo(player.getCurrentTime() - 5, true)
          break
        case 'ArrowRight':
          e.preventDefault()
          player.seekTo(player.getCurrentTime() + 5, true)
          break
        case 's':
        case 'S': {
          const next = (speedIndex + 1) % SPEEDS.length
          setSpeedIndex(next)
          player.setPlaybackRate(SPEEDS[next])
          break
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [speedIndex])

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

      {/* HUD — visible once a video is loaded */}
      {videoId && (
        <div className="bg-zinc-800 border-t border-zinc-700 px-4 py-2 font-mono text-sm text-zinc-300 flex gap-6">
          <span>SPEED: {SPEED_LABELS[speedIndex]}</span>
          <span>LOOP: —</span>
        </div>
      )}
    </div>
  )
}

export default App
