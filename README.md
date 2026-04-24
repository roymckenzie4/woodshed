# woodshed

A keyboard-controlled YouTube practice tool. Load any video, loop a section, and slow it down — useful for learning music, transcribing, or studying anything closely.

Inspired by the [Vidami pedal](https://vidami.com).

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / pause |
| `←` / `→` | Skip back / forward 5s |
| `S` | Cycle speed: 100% → 75% → 50% → 35% → 20% |
| `L` | First press: set loop start. Second press: set loop end. Third press: clear loop. |

Shortcuts are disabled while the URL input is focused.

## Running locally

```
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Stack

Vite + React, Tailwind CSS, YouTube IFrame API.
