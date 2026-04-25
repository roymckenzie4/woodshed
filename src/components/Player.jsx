import { useEffect, useRef } from 'react'

// Player manages the YT.Player instance lifecycle.
// It renders a mount point div and creates/destroys the player
// whenever videoId or ytReady changes.
function Player({ videoId, ytReady, onPlayerReady, onPlayStateChange }) {
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!ytReady || !videoId) return

    // Destroy any existing player before creating a new one
    if (instanceRef.current) {
      instanceRef.current.destroy()
      instanceRef.current = null
    }

    instanceRef.current = new window.YT.Player('yt-player', {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        // Let YouTube show its native controls — we layer our own keyboard
        // shortcuts on top via document keydown, but the native controls
        // are useful for scrubbing with a mouse.
        controls: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (e) => onPlayerReady(e.target),
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            onPlayStateChange?.(true)
          } else if (e.data === window.YT.PlayerState.PAUSED) {
            onPlayStateChange?.(false)
          }
          // Ignore BUFFERING and other transient states to avoid icon flicker
        },
      },
    })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy()
        instanceRef.current = null
      }
    }
  }, [videoId, ytReady])

  if (!videoId) return null

  return (
    <div className="w-full aspect-video bg-black md:aspect-auto md:h-full">
      <div id="yt-player" className="w-full h-full" />
    </div>
  )
}

export default Player
