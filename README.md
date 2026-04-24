# woodshed

**[woodshed.tools](https://woodshed.tools)**

A keyboard-controlled YouTube practice tool. Load any video, loop a section, and slow it down — useful for learning music, transcribing, or studying anything closely.

Inspired by the [Vidami pedal](https://vidami.com).

## Keyboard shortcuts

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

## Running locally

```
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Stack

Vite + React, Tailwind CSS, YouTube IFrame API.
