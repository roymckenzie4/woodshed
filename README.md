# woodshed

**[woodshed.tools](https://woodshed.tools)**

A keyboard-controlled YouTube practice tool. Load any video, loop a section, and slow it down — useful for learning music, transcribing, or studying anything closely. Works on desktop with keyboard shortcuts and on mobile with tap controls.

Inspired by the [Vidami pedal](https://vidami.com).

## Keyboard shortcuts (desktop)

| Key | Action |
|-----|--------|
| `Space` | Play / pause |
| `←` / `→` | Skip back / forward 5s |
| `S` | Cycle speed: 100% → 85% → 70% → 55% → 40% |
| `L` | First press: set loop start. Second press: set loop end. Third press: clear loop. |
| `[` / `]` | Nudge loop start back / forward 0.25s |
| `{` / `}` | Nudge loop end back / forward 0.25s |
| `?` | Toggle keyboard shortcut cheatsheet |

Shortcuts are disabled while the URL input is focused. Loading a new video resets speed and loop.

## Mobile

Three-row tap control panel below the video:

- **Transport** — seek back 5s, play/pause, seek forward 5s
- **Speed** — tap to cycle through speeds; value turns amber when below 100% as a passive indicator
- **Loop** — the hero button; guides you through in/out point setting with hint text at each state; turns green with timestamps when a loop is running

## Running locally

```
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Stack

Vite + React, Tailwind CSS, YouTube IFrame API.
