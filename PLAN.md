# Woodshed — Plan

## Context

Building a personal YouTube practice tool inspired by the Vidami pedal. The goal is a keyboard-driven interface for looping and slowing down video — useful for learning music or transcribing. No TypeScript, no over-engineering. Vite + React + Tailwind, localStorage persistence, full-width player layout.

---

## Stack

- **Vite + React** (no TypeScript) — `npm create vite@latest` baseline
- **Tailwind CSS v3** — via PostCSS
- **YouTube IFrame API** — loaded dynamically via JS (not from index.html), so we control the `onYouTubeIframeAPIReady` callback cleanly within React

---

## File Structure

```
woodshed/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── index.css          (Tailwind directives)
    ├── App.jsx            (all state, keyboard handler, loop interval)
    └── components/
        ├── UrlInput.jsx
        ├── Player.jsx
        └── HUD.jsx
```

Keeping it flat. No custom hooks directory — the logic is simple enough to live in App.jsx without abstraction.

---

## State (all in App.jsx)

```js
url          // string — raw input value
videoId      // string — extracted from URL, triggers player creation
ytReady      // bool — true once window.YT is available
player       // ref — YT.Player instance
speedIndex   // number — index into SPEEDS array
loopStart    // number | null — seconds
loopEnd      // number | null — seconds
loopState    // 0 | 1 | 2 — (none / start-set / active)
```

Constants:
```js
const SPEEDS = [1.0, 0.75, 0.5, 0.35, 0.2]
const SPEED_LABELS = ['100%', '75%', '50%', '35%', '20%']
```

---

## YouTube IFrame API Lifecycle

Load the script once in a `useEffect` in App.jsx:
```js
useEffect(() => {
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
  window.onYouTubeIframeAPIReady = () => setYtReady(true)
}, [])
```

When both `ytReady` and `videoId` are truthy, `Player.jsx` mounts a `<div id="yt-player">` and the player is created. When `videoId` changes, destroy the old player and create a new one.

---

## Components

### `UrlInput.jsx`
- Controlled input, ref forwarded so App can check `document.activeElement`
- On submit (Enter or button): extract video ID via regex, call `onLoad(videoId)`
- Video ID regex: `/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/`

### `Player.jsx`
- Renders a `<div id="yt-player">` as the mount target
- Receives `videoId`, `ytReady`, `onPlayerReady` (callback with player instance)
- `useEffect([videoId, ytReady])`: destroys old player if present, creates new `YT.Player`
- Aspect ratio container: `aspect-video w-full`

### `HUD.jsx`
- Receives `speedLabel`, `loopStart`, `loopEnd`, `loopState`
- Displays: `SPEED: 75%  |  LOOP: 0:32 → 1:04 ●`
- `loopState 0`: `LOOP: —`
- `loopState 1`: `LOOP: 0:32 → …`
- `loopState 2`: `LOOP: 0:32 → 1:04` with active indicator
- Dark bar below the player, monospace font

---

## Keyboard Handler (in App.jsx)

Attached to `document` via `useEffect`. Skips if `document.activeElement === inputRef.current`.

| Key          | Action                                      |
|--------------|---------------------------------------------|
| `Space`      | Play / pause                                |
| `ArrowLeft`  | Seek back 5s                                |
| `ArrowRight` | Seek forward 5s                             |
| `S`          | Cycle speed: 100→75→50→35→20→100%          |
| `L`          | First: set loop start. Second: set loop end. Third: clear loop |

Re-registers whenever `loopState` or `player` changes (via dependency array).

---

## Loop Logic (in App.jsx)

```js
useEffect(() => {
  if (loopState !== 2 || !player) return
  const id = setInterval(() => {
    if (player.getCurrentTime() >= loopEnd) {
      player.seekTo(loopStart, true)
    }
  }, 100)
  return () => clearInterval(id)
}, [loopState, loopStart, loopEnd, player])
```

Runs only when `loopState === 2` (both points set). Cleans up on state change.

---

## localStorage Persistence

On mount: read `woodshed` key, restore `url`, `speedIndex`, `loopStart`, `loopEnd`, `loopState`.

On each relevant state change: write back. Saved URL auto-populates the input; saved speed is applied once the player is ready.

---

## Layout (full-width)

```
┌──────────────────────────────────────────────┐
│  woodshed                    [URL input] [Go] │  ← header bar
├──────────────────────────────────────────────┤
│                                              │
│            YouTube Player (16:9)            │
│                                              │
├──────────────────────────────────────────────┤
│  SPEED: 75%  │  LOOP: 0:32 → 1:04 ●         │  ← HUD bar
└──────────────────────────────────────────────┘
```

Dark theme (`bg-zinc-900 text-white`). HUD uses a slightly lighter bar (`bg-zinc-800`).

---

## Development Phases

### Phase 1 — Scaffolding
- Create `PLAN.md` in project root (copy of this plan)
- Init Vite + React project (no TypeScript)
- Install and configure Tailwind CSS v3
- Verify `npm run dev` serves a blank page cleanly

### Phase 2 — YouTube Player
- Build `Player.jsx`: mounts `<div id="yt-player">`, manages `YT.Player` lifecycle
- Load IFrame API script dynamically in `App.jsx`; expose `ytReady` state
- Build `UrlInput.jsx`: controlled input + video ID extraction
- Wire: entering a URL creates and plays the video
- Verify: paste a URL, video loads and plays

### Phase 3 — Keyboard Controls
- Attach `keydown` listener to `document` in `App.jsx`
- Implement Space (play/pause), ArrowLeft/Right (±5s)
- Implement S (speed cycle) + `SPEEDS` constant
- Guard: skip keyboard actions when URL input is focused
- Verify: all keys work; typing a URL doesn't trigger shortcuts

### Phase 4 — Loop
- Add `loopState`, `loopStart`, `loopEnd` to state
- Implement L key: set start → set end → clear cycle
- Add `setInterval` loop enforcer in `useEffect`
- Verify: loop bounces between two points; third L clears it

### Phase 5 — HUD
- Build `HUD.jsx`: shows speed label and loop status
- Format: `SPEED: 75%  |  LOOP: 0:32 → 1:04 ●`
- Style: dark bar (`bg-zinc-800`), monospace, below the player
- Verify: HUD updates live as speed and loop change

### Phase 6 — Persistence
- On mount: read `woodshed` from localStorage, restore state
- On state change: write back URL, speedIndex, loopStart, loopEnd, loopState
- Apply restored speed once player is ready
- Verify: reload page → state is preserved

---

## Future Ideas

- **Keyboard shortcut cheatsheet** — press `?` to toggle an overlay listing all shortcuts. Quick win, no state changes needed.
- **Loop nudging** — additional keys to shift the loop start/end point by small increments (e.g. `[` / `]` to nudge start, `{` / `}` to nudge end). Useful for dialing in a loop precisely without re-setting it from scratch.
- **Named loop presets** — save and name multiple loops per video (e.g. "verse", "bridge solo"). Store as an array in localStorage alongside the current loop state.
- **Custom speed presets** — let the user define their own set of speeds instead of the hardcoded defaults. Could live in a settings panel alongside the cheatsheet.

---

## Verification

1. `npm install && npm run dev` — app loads at localhost:5173
2. Paste a YouTube URL → video loads and plays
3. `Space` → pauses/plays
4. `←` / `→` → seeks ±5s
5. `S` → cycles speed; HUD updates
6. `L` × 1 → HUD shows `LOOP: X:XX → …`; `L` × 2 → loop activates, video loops; `L` × 3 → loop clears
7. Click URL input, press keys → no playback actions fire
8. Reload page → URL, speed, loop points restored from localStorage
