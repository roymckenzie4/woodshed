import { useState, useEffect, useRef } from 'react'
import UrlInput from './components/UrlInput.jsx'
import Player from './components/Player.jsx'
import HUD from './components/HUD.jsx'
import Cheatsheet from './components/Cheatsheet.jsx'
import MobileControls from './components/MobileControls.jsx'

const SPEEDS = [1.0, 0.85, 0.70, 0.55, 0.40]
const SPEED_LABELS = ['100%', '85%', '70%', '55%', '40%']
const STORAGE_KEY = 'woodshed'
const NUDGE = 0.25

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function App() {
  const saved = useRef(loadSaved())

  const [ytReady, setYtReady] = useState(false)
  const [url, setUrl] = useState(saved.current.url || '')
  const [videoId, setVideoId] = useState(saved.current.videoId || '')
  const [speedIndex, setSpeedIndex] = useState(saved.current.speedIndex ?? 0)
  const [loopState, setLoopState] = useState(saved.current.loopState ?? 0)
  const [loopStart, setLoopStart] = useState(saved.current.loopStart ?? null)
  const [loopEnd, setLoopEnd] = useState(saved.current.loopEnd ?? null)
  const [showCheatsheet, setShowCheatsheet] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef(null)
  const inputRef = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      url, videoId, speedIndex, loopState, loopStart, loopEnd,
    }))
  }, [url, videoId, speedIndex, loopState, loopStart, loopEnd])

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    function handleBlur() {
      setTimeout(() => appRef.current?.focus(), 0)
    }
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [])

  useEffect(() => {
    if (loopState !== 2 || !playerRef.current) return
    const id = setInterval(() => {
      if (playerRef.current.getCurrentTime() >= loopEnd) {
        playerRef.current.seekTo(loopStart, true)
      }
    }, 100)
    return () => clearInterval(id)
  }, [loopState, loopStart, loopEnd])

  // --- Shared action handlers ---
  // Defined here so both the keyboard handler and MobileControls can call them.
  // Each function reads playerRef.current at call time, so they're always fresh.

  function handlePlayPause() {
    const player = playerRef.current
    if (!player) return
    if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  function handleSeekBack() {
    const player = playerRef.current
    if (!player) return
    player.seekTo(player.getCurrentTime() - 5, true)
  }

  function handleSeekForward() {
    const player = playerRef.current
    if (!player) return
    player.seekTo(player.getCurrentTime() + 5, true)
  }

  function handleCycleSpeed() {
    const player = playerRef.current
    if (!player) return
    const next = (speedIndex + 1) % SPEEDS.length
    setSpeedIndex(next)
    player.setPlaybackRate(SPEEDS[next])
  }

  function handleAdvanceLoop() {
    const player = playerRef.current
    if (!player) return
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
  }

  // Keyboard handler — dependencies include loopStart/loopEnd (for nudge
  // clamping) and showCheatsheet (to gate shortcuts while overlay is open)
  useEffect(() => {
    function handleKey(e) {
      // Escape always closes the cheatsheet regardless of focus
      if (e.key === 'Escape') {
        setShowCheatsheet(false)
        return
      }

      if (document.activeElement === inputRef.current) return

      // While the cheatsheet is open, only ? is active (to close it)
      if (showCheatsheet) {
        if (e.key === '?') setShowCheatsheet(false)
        return
      }

      const player = playerRef.current
      if (!player) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          handlePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSeekBack()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSeekForward()
          break
        case 's':
        case 'S':
          handleCycleSpeed()
          break
        case 'l':
        case 'L':
          handleAdvanceLoop()
          break
        // Nudge loop start back/forward — only when a start point exists
        case '[':
          if (loopState >= 1) {
            setLoopStart(prev => Math.max(0, prev - NUDGE))
          }
          break
        case ']':
          if (loopState >= 1) {
            setLoopStart(prev =>
              loopEnd !== null ? Math.min(loopEnd - NUDGE, prev + NUDGE) : prev + NUDGE
            )
          }
          break
        // Nudge loop end back/forward — only when the full loop is set
        case '{':
          if (loopState === 2) {
            setLoopEnd(prev => Math.max(loopStart + NUDGE, prev - NUDGE))
          }
          break
        case '}':
          if (loopState === 2) {
            setLoopEnd(prev => prev + NUDGE)
          }
          break
        case '?':
          setShowCheatsheet(true)
          break
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [speedIndex, loopState, loopStart, loopEnd, showCheatsheet])

  function handlePlayerReady(player) {
    playerRef.current = player
    if (speedIndex > 0) {
      player.setPlaybackRate(SPEEDS[speedIndex])
    }
    if (loopStart !== null) {
      player.seekTo(loopStart, true)
    }
  }

  function handleLoad(id) {
    if (id === videoId) return
    setVideoId(id)
    setSpeedIndex(0)
    setLoopState(0)
    setLoopStart(null)
    setLoopEnd(null)
  }

  return (
    <div ref={appRef} tabIndex={-1} className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden outline-none">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <span className="font-mono text-white text-xs tracking-[0.25em] uppercase">woodshed</span>
        <div className="flex-1 min-w-0 ml-4">
          <UrlInput ref={inputRef} value={url} onChange={setUrl} onLoad={handleLoad} />
        </div>
      </header>

      {/* Player */}
      <main className="md:flex-1 md:min-h-0">
        {videoId ? (
          <Player
            videoId={videoId}
            ytReady={ytReady}
            onPlayerReady={handlePlayerReady}
            onPlayStateChange={setIsPlaying}
          />
        ) : (
          <div className="flex items-center justify-center h-64 md:h-full text-zinc-600 font-mono text-sm">
            paste a YouTube URL above to begin
          </div>
        )}
      </main>

      {/* Mobile controls — tap buttons, hidden on desktop */}
      {videoId && (
        <MobileControls
          isPlaying={isPlaying}
          speedLabel={SPEED_LABELS[speedIndex]}
          loopState={loopState}
          loopStart={loopStart}
          loopEnd={loopEnd}
          onPlayPause={handlePlayPause}
          onSeekBack={handleSeekBack}
          onSeekForward={handleSeekForward}
          onCycleSpeed={handleCycleSpeed}
          onAdvanceLoop={handleAdvanceLoop}
        />
      )}

      {/* HUD — desktop only, mobile gets speed/loop info from MobileControls */}
      {videoId && (
        <div className="hidden md:block">
          <HUD
            speedLabel={SPEED_LABELS[speedIndex]}
            loopState={loopState}
            loopStart={loopStart}
            loopEnd={loopEnd}
          />
        </div>
      )}

      {/* Cheatsheet overlay */}
      {showCheatsheet && <Cheatsheet onClose={() => setShowCheatsheet(false)} />}
    </div>
  )
}

export default App
