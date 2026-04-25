# Mobile Support Plan — COMPLETED

## Context
woodshed.tools was entirely keyboard-driven — space, s, l, arrows, brackets. On mobile none of these work, and iOS blocks YouTube autoplay. The goal was a touch control layer that gives full functionality on phones while leaving all desktop keyboard behavior untouched. Nudge buttons (±0.25s loop tweaks) were skipped to keep the mobile UI clean.

---

## What was built

### Stage 1 — Layout fixes
- `UrlInput`: removed `w-72`, replaced with `flex-1 min-w-0` so the input expands on narrow screens
- `App.jsx` header: wrapped UrlInput in a `flex-1 min-w-0` container

### Stage 2 — Player changes
- Removed `autoplay: 1` (iOS blocks it; desktop users use spacebar)
- Added `onStateChange` event → fires `onPlayStateChange(bool)` up to App, used to drive the play/pause button icon
- Only updates play state on PLAYING/PAUSED events — ignores BUFFERING to prevent icon flicker on seeks
- Mobile: video uses `aspect-video` to render at natural 16:9 instead of stretching to fill the flex container

### Stage 3 — Shared action handlers
Extracted keyboard switch cases into named functions in `App.jsx`:
- `handlePlayPause`, `handleSeekBack`, `handleSeekForward`, `handleCycleSpeed`, `handleAdvanceLoop`

Also added `isPlaying` state, updated via `onPlayStateChange` from Player.

### Stage 4 — MobileControls component
Three-row layout, `flex-1` so it fills all space below the video. `md:hidden` — invisible on desktop.

**Row 1 — transport** (fixed `h-20`): three separate card buttons with gaps — ← 5S, ▶/⏸, 5S →

**Row 2 — speed** (fixed `h-20`): single card button. "SPEED" sublabel above value. Value turns amber when not at 100% — passive indicator that slow mode is active.

**Row 3 — loop** (`flex-1`, hero element): largest button on the page, thumb-accessible. Three states:
- Inactive: dim, "LOOP", hint "TAP TO SET IN POINT"
- Start set: amber border + text, "LOOP IN SET", shows `start → ?`, hint "TAP TO SET OUT POINT"
- Active: green border + `bg-emerald-950` tint, "LOOPING", shows full timestamps, hint "TAP TO CLEAR"

### Polish fixes (post-deploy testing)
- `⏸\uFE0E` / `▶\uFE0E` — Unicode text variation selector forces glyph rendering instead of emoji on mobile
- `h-dvh` instead of `h-screen` — dynamic viewport height accounts for mobile browser chrome
- `viewport-fit=cover` in viewport meta — allows app to draw behind iOS notch/home indicator
- `theme-color` meta tag — Chrome on Android paints browser chrome to match the header (zinc-950)
- `html, body { background-color: #18181b }` — fills safe areas with zinc-900 so no white peeks through
- `env(safe-area-inset-bottom)` padding on MobileControls — loop button stays above home indicator

---

## Files changed

| File | Change |
|------|--------|
| `src/App.jsx` | Extracted action handlers, added `isPlaying` state, fixed header/layout, renders MobileControls, `h-dvh` |
| `src/components/UrlInput.jsx` | Removed `w-72`, flex-grow |
| `src/components/Player.jsx` | Removed autoplay, added onStateChange, mobile aspect ratio, flicker fix |
| `src/components/MobileControls.jsx` | New — three-row touch control panel |
| `src/index.css` | Dark html/body background |
| `index.html` | `theme-color` meta, `viewport-fit=cover` |

---

## Verification checklist

- [x] Desktop: all keyboard shortcuts still work
- [x] Desktop: layout visually unchanged
- [x] Desktop: video loads paused (autoplay removed) — spacebar starts it
- [x] Mobile: header URL input doesn't overflow
- [x] Mobile: video renders at 16:9 aspect ratio
- [x] Mobile: three control rows visible and tappable
- [x] Mobile: play/pause icon updates correctly, no flicker on seek
- [x] Mobile: speed turns amber when not at 100%
- [x] Mobile: loop cycles through all 3 states with correct colors and timestamps
- [x] Mobile: safe area insets respected (no content behind home indicator)
- [x] Mobile: status bar and bottom bar match app dark theme
