# Mobile Support Plan

## Context
woodshed.tools is entirely keyboard-driven — space, s, l, arrows, brackets. On mobile none of these work, and iOS blocks YouTube autoplay. The goal is a touch control layer that gives full functionality on phones while leaving all desktop keyboard behavior untouched. Nudge buttons (±0.25s loop tweaks) are skipped for now to keep the mobile UI clean.

---

## Stages

### Stage 1 — Layout fixes
*Simple CSS/class changes, no logic involved.*

**`src/components/UrlInput.jsx`**
- Remove `w-72` from the `<input>`, replace with `flex-1 min-w-0`
- Make the outer `<div>` also `flex-1 min-w-0` so it expands inside the header

**`src/App.jsx` — header**
- Wrap UrlInput in a `flex-1 min-w-0` container so it fills available header space

---

### Stage 2 — Player changes
*Remove autoplay, wire up play state, fix mobile aspect ratio.*

**`src/components/Player.jsx`**
1. Remove `autoplay: 1` from `playerVars` (iOS blocks it silently; desktop users use spacebar, mobile users use the play button)
2. Add `onStateChange` event handler that calls `onPlayStateChange(isPlaying: bool)` up to App
3. Change container classes so mobile renders video at natural 16:9 instead of stretching to fill the flex container (which produces ugly black bars):
   - Outer div: `w-full h-full` → `w-full md:h-full`
   - Inner div: `w-full h-full` → `w-full aspect-video md:aspect-auto md:h-full`

---

### Stage 3 — Extract shared action handlers in App.jsx
*Refactor so both keyboard shortcuts and mobile buttons call the same functions.*

Extract inline keyboard switch cases into named functions:

```js
function handlePlayPause() { ... }
function handleSeekBack() { ... }
function handleSeekForward() { ... }
function handleCycleSpeed() { ... }
function handleAdvanceLoop() { ... }
```

Also:
- Add `isPlaying` state (default `false`), updated via `onPlayStateChange` callback from Player
- Update root div classes for mobile layout: `overflow-y-auto md:overflow-hidden`

---

### Stage 4 — MobileControls component
*New component, mobile-only, single row of 5 tap buttons.*

**`src/components/MobileControls.jsx`** (new file)

Rendered in App.jsx below the player, `block md:hidden`.

Single row:
```
[ ←5s ]  [ ▶/⏸ ]  [ 5s→ ]  [ 100% ]  [ LOOP ]
```

Button behavior:
- **←5s / 5s→** — seek back/forward 5 seconds
- **▶/⏸** — toggle play/pause; icon reflects `isPlaying` state
- **Speed** — cycles speed on tap; label shows current value (e.g. "85%")
- **Loop** — advances loop state on tap; label/color reflects current state:
  - State 0: "LOOP" (dim zinc)
  - State 1: "SET END" (amber — waiting for end point)
  - State 2: "LOOP ✓" (emerald — active; next tap clears)

Style: matches HUD — `bg-zinc-800 border-t border-zinc-700 font-mono text-xs uppercase tracking-widest`, min 44px tap target height.

Props: `isPlaying`, `speedLabel`, `loopState`, `onPlayPause`, `onSeekBack`, `onSeekForward`, `onCycleSpeed`, `onAdvanceLoop`

---

## Files changed

| File | Change |
|------|--------|
| `src/App.jsx` | Extract handlers, add `isPlaying` state, fix header/layout classes, render MobileControls |
| `src/components/UrlInput.jsx` | Remove `w-72`, make input + wrapper flex-grow |
| `src/components/Player.jsx` | Remove autoplay, add onStateChange, fix mobile aspect ratio |
| `src/components/MobileControls.jsx` | New file — touch control row |

---

## Verification checklist

- [ ] Desktop: all keyboard shortcuts still work
- [ ] Desktop: layout visually unchanged
- [ ] Desktop: video loads paused (autoplay removed) — spacebar starts it
- [ ] Mobile: header URL input doesn't overflow
- [ ] Mobile: video renders at 16:9 aspect ratio (no giant black bars)
- [ ] Mobile: all 5 control buttons visible and tappable
- [ ] Mobile: play/pause button icon updates correctly
- [ ] Mobile: speed button label updates on tap
- [ ] Mobile: loop button cycles through all 3 states correctly
- [ ] iOS Safari: YouTube player loads and play button works
