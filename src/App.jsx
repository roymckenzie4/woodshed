import { useState, useEffect, useRef } from 'react'
import UrlInput from './components/UrlInput.jsx'
import Player from './components/Player.jsx'

const SPEEDS = [1.0, 0.75, 0.5, 0.35, 0.2]
const SPEED_LABELS = ['100%', '75%', '50%', '35%', '20%']

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function App() {
  const [ytReady, setYtReady] = useState(false)
  const [videoId, setVideoId] = useState('')
  const [speedIndex, setSpeedIndex] = useState(0)
  const [loopState, setLoopState] = useState(0) // 0=off, 1=start set, 2=active
  const [loopStart, setLoopStart] = useState(null)
  const [loopEnd, setLoopEnd] = useState(null)
  const playerRef = useRef(null)
  const inputRef = useRef(null)

  // Load the YouTube IFrame API script once on mount
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [])

  // Loop enforcer — polls currentTime every 100ms and seeks back to loopStart
  // when the playhead passes loopEnd. Only runs when loopState === 2.
  useEffect(() => {
    if (loopState !== 2 || !playerRef.current) return
    const id = setInterval(() => {
      if (playerRef.current.getCurrentTime() >= loopEnd) {
        playerRef.current.seekTo(loopStart, true)
      }
    }, 100)
    return () => clearInterval(id)
  }, [loopState, loopStart, loopEnd])

  // Keyboard handler — re-registers when speedIndex or loopState changes
  // so the handler always sees current values rather than a stale closure
  useEffect(() => {
    function handleKey(e) {
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
        case 'l':
        case 'L': {
          if (loopState === 0) {
            setLoopStart(player.getCurrentTime())
            setLoopState(1)
          } else if (loopState === 1) {
            setLoopEnd(player.getCurrentTime())
            setLoopState(2)
          } else {
            setLoopStart(null)
            setLoopEnd(null)
            setLoopState(0)
          }
          break
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [speedIndex, loopState])

  function handlePlayerReady(player) {
    playerRef.current = player
  }

  function loopStatus() {
    if (loopState === 0) return 'LOOP: —'
    if (loopState === 1) return `LOOP: ${formatTime(loopStart)} → ?`
    return `LOOP: ${formatTime(loopStart)} → ${formatTime(loopEnd)}`
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

      {/* HUD */}
      {videoId && (
        <div className="bg-zinc-800 border-t border-zinc-700 px-4 py-2 font-mono text-sm text-zinc-300 flex gap-6">
          <span>SPEED: {SPEED_LABELS[speedIndex]}</span>
          <span className={loopState === 2 ? 'text-green-400' : ''}>{loopStatus()}</span>
        </div>
      )}
    </div>
  )
}

export default App
