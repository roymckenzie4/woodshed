import { useEffect, useRef } from 'react'

// Player manages the YT.Player instance lifecycle.
// It renders a mount point div and creates/destroys the player
// whenever videoId or ytReady changes.
function Player({ videoId, ytReady, onPlayerReady }) {
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
      playerVars: {
        autoplay: 1,
        // Let YouTube show its native controls — we layer our own keyboard
        // shortcuts on top via document keydown, but the native controls
        // are useful for scrubbing with a mouse.
        controls: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (e) => onPlayerReady(e.target),
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
    <div className="w-full aspect-video bg-black">
      <div id="yt-player" className="w-full h-full" />
    </div>
  )
}

export default Player
