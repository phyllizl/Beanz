# Beanz — React + Expo Rebuild

## Overview

Rebuild the Beanz speed-tapping game from jQuery/vanilla JS to React Native using Expo. Target platforms: Android (Google Play) and web. 1:1 feature parity with the existing game — no new features in this pass.

## Screen Flow

Three screens in a linear forward-only flow using `expo-router` stack navigation:

1. **Splash** — "ARE YOU READY FOR BEANZ" title + "PLAY NOW" button → Instructions
2. **Instructions** — Game rules with inline bean images explaining each bean type and scoring → Game
3. **Game** — Playable game board. After the timer ends: final score, "PLAY AGAIN" (restarts level 1), "LEVEL 2" (starts 9x9 grid)

No back navigation. Stack with `headerShown: false`.

## Game Mechanics

All mechanics are identical to the original:

- **Grid:** Level 1 = 6x6 (36 cells), Level 2 = 9x9 (81 cells)
- **Bean placement:** 35% green beans (30% in level 2), remainder red. Placed randomly with no duplicates.
- **Magic beans:** Appear every 5 seconds on the countdown. Replace random cells for 2 seconds, then revert to their original type.
- **Tapping:**
  - Green bean → becomes sprout, +5 points
  - Red bean → becomes monster for 0.5s then reverts to red bean image, -3 points
  - Magic bean → becomes star, +8 points
- **Grid shuffle:** After every tap, all cells are randomly reshuffled in position.
- **Timer:** 12-second countdown. When it hits 0, tapping is disabled and the game-over panel appears.

## Game State

Single custom hook `useGame` manages all state:

| State | Type | Description |
|-------|------|-------------|
| `score` | `number` | Current score, starts at 0 |
| `timeLeft` | `number` | Countdown from 12 |
| `isRunning` | `boolean` | Whether the timer is active |
| `grid` | `Cell[]` | Array of cell objects |
| `level` | `1 \| 2` | Current difficulty level |

Each cell: `{ id: string, type: 'green' | 'red' | 'magic', tapped: boolean, originalType?: 'green' | 'red' }`

`originalType` is set when a cell becomes magic, so it can revert after 2 seconds.

### Hook API

```ts
useGame(level: 1 | 2) => {
  score: number;
  timeLeft: number;
  isRunning: boolean;
  grid: Cell[];
  startGame: () => void;
  tapCell: (id: string) => void;
  isGameOver: boolean;
}
```

- `startGame()` — resets score to 0, rebuilds the grid, starts the timer
- `tapCell(id)` — applies scoring, marks cell as tapped, shuffles grid

## Component Structure

```
App
├── SplashScreen        — title + play button
├── InstructionsScreen   — rules text with inline bean images
└── GameScreen
    ├── ScoreBoard       — timer countdown + current score
    ├── BeanGrid         — renders grid of BeanCell components
    │   └── BeanCell     — single Pressable, shows image based on type + tapped state
    └── GameOverPanel    — final score + Play Again / Level 2 buttons
```

### BeanCell

- `Pressable` component
- Displays image based on: `type` × `tapped` state
  - green + not tapped → `greenbean.gif`
  - green + tapped → `greenSoil.png`
  - red + not tapped → `3dgifmaker89063.gif`
  - red + tapped → `monster.gif` (briefly), then `3dgifmaker89063.gif`
  - magic + not tapped → `magicBeans.gif`
  - magic + tapped → `newstar.png`
- Size: container width / gridSize (square cells)
- Disabled when `isGameOver` or `tapped` (except red, which can be tapped multiple times as in the original)

### BeanGrid

- `FlatList` with `numColumns` set to gridSize
- Receives `grid` array and `onTap` callback
- `key` prop changes when level changes to force re-render with new column count

### ScoreBoard

- Displays `timeLeft` and `score`
- Contains the START button before the game begins

### GameOverPanel

- Shown when `isGameOver` is true
- Displays final score
- "PLAY AGAIN" calls `startGame()` with level 1
- "LEVEL 2" calls `startGame()` with level 2

## Project Structure

```
beanz/
├── app/
│   ├── _layout.tsx        — expo-router stack, headerShown: false
│   ├── index.tsx          — SplashScreen
│   ├── instructions.tsx   — InstructionsScreen
│   └── game.tsx           — GameScreen
├── components/
│   ├── BeanCell.tsx
│   ├── BeanGrid.tsx
│   ├── ScoreBoard.tsx
│   └── GameOverPanel.tsx
├── hooks/
│   └── useGame.ts
├── constants/
│   └── game.ts
└── assets/
    ├── 3dgifmaker89063.gif
    ├── greenbean.gif
    ├── greenSoil.png
    ├── magicBeans.gif
    ├── monster.gif
    └── newstar.png
```

## Constants

All in `constants/game.ts`:

```ts
export const LEVELS = {
  1: { gridSize: 6, greenPercent: 35, magicCount: 2 },
  2: { gridSize: 9, greenPercent: 30, magicCount: 5 },
};
export const TIMER_DURATION = 12;
export const MAGIC_INTERVAL = 5;
export const MAGIC_VISIBLE_DURATION = 2000;
export const POINTS = { green: 5, red: -3, magic: 8 };
```

## Styling

- React Native `StyleSheet` — no external CSS library
- Black background, yellow text (PacFont for titles, system sans-serif for body)
- PacFont loaded via `expo-font`
- Mobile-first layout; grid cells size dynamically based on screen width

## Dependencies

- `expo` — managed workflow
- `expo-router` — navigation
- `expo-image` — animated GIF support
- `expo-font` — custom PacFont loading

## Platform Notes

- **Android:** Build via `eas build --platform android`. Publish to Google Play via EAS Submit.
- **Web:** `npx expo start --web` for dev, `npx expo export --platform web` for production build.

## Out of Scope

- iOS support
- Sound effects
- User accounts / authentication
- Persistent high scores / leaderboards
- Haptic feedback
- Additional levels beyond 2

These can all be added in future iterations.
