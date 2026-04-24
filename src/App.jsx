import { useState, useEffect, useRef } from 'react'
import UrlInput from './components/UrlInput.jsx'
import Player from './components/Player.jsx'
import HUD from './components/HUD.jsx'

const SPEEDS = [1.0, 0.75, 0.5, 0.35, 0.2]
const SPEED_LABELS = ['100%', '75%', '50%', '35%', '20%']
const STORAGE_KEY = 'woodshed'

// Read whatever we previously saved, falling back to an empty object if
// nothing is there yet (first visit) or the JSON is somehow corrupt.
function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function App() {
  const saved = useRef(loadSaved()) // read once on first render, store in a ref

  const [ytReady, setYtReady] = useState(false)
  const [url, setUrl] = useState(saved.current.url || '')
  const [videoId, setVideoId] = useState(saved.current.videoId || '')
  const [speedIndex, setSpeedIndex] = useState(saved.current.speedIndex ?? 0)
  const [loopState, setLoopState] = useState(saved.current.loopState ?? 0)
  const [loopStart, setLoopStart] = useState(saved.current.loopStart ?? null)
  const [loopEnd, setLoopEnd] = useState(saved.current.loopEnd ?? null)
  const playerRef = useRef(null)
  const inputRef = useRef(null)
  const appRef = useRef(null)

  // Persist state to localStorage whenever any of these values change.
  // JSON.stringify turns the object into a string so localStorage can store it.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      url,
      videoId,
      speedIndex,
      loopState,
      loopStart,
      loopEnd,
    }))
  }, [url, videoId, speedIndex, loopState, loopStart, loopEnd])

  // Load the YouTube IFrame API script once on mount
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    // When the user clicks the YouTube iframe, focus moves into the cross-origin
    // document and our keydown listener stops firing. Stealing focus back to
    // appRef keeps our shortcuts working while still letting YouTube register
    // mouse clicks (play/pause, scrubbing, etc.).
    function handleBlur() {
      setTimeout(() => appRef.current?.focus(), 0)
    }
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
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
    // Apply saved speed — the player resets to 1x on every new load,
    // so we need to re-apply our setting once it's ready
    if (speedIndex > 0) {
      player.setPlaybackRate(SPEEDS[speedIndex])
    }
    // Seek to loop start so playback resumes from the right spot
    if (loopStart !== null) {
      player.seekTo(loopStart, true)
    }
  }

  function handleLoad(id) {
    setVideoId(id)
  }

  return (
    <div ref={appRef} tabIndex={-1} className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden outline-none">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <span className="font-mono text-white text-xs tracking-[0.25em] uppercase">woodshed</span>
        <UrlInput ref={inputRef} value={url} onChange={setUrl} onLoad={handleLoad} />
      </header>

      {/* Player */}
      <main className="flex-1 min-h-0">
        {videoId ? (
          <Player
            videoId={videoId}
            ytReady={ytReady}
            onPlayerReady={handlePlayerReady}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 font-mono text-sm">
            paste a YouTube URL above to begin
          </div>
        )}
      </main>

      {/* HUD */}
      {videoId && (
        <HUD
          speedLabel={SPEED_LABELS[speedIndex]}
          loopState={loopState}
          loopStart={loopStart}
          loopEnd={loopEnd}
        />
      )}
    </div>
  )
}

export default App
