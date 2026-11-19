# Beanz Expo Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Beanz speed-tapping game as a React Native app using Expo, targeting Android and web with 1:1 feature parity.

**Architecture:** Expo managed workflow with expo-router for screen navigation. All game logic lives in a single `useGame` custom hook. Components are thin presentational wrappers. Assets are the existing GIF/PNG files.

**Tech Stack:** React Native, Expo (managed), expo-router, expo-image, expo-font, TypeScript, Jest + React Native Testing Library

**Spec:** `docs/superpowers/specs/2026-11-10-beanz-expo-rebuild-design.md`

## Global Constraints

- Expo SDK 53 (latest stable)
- TypeScript strict mode
- No external state management libraries — React hooks only
- No external CSS/styling libraries — React Native `StyleSheet` only
- Target platforms: Android + Web (no iOS)
- All game constants in `constants/game.ts` — no magic numbers in components or hooks
- PacFont for titles, system sans-serif for body text
- Black background (#000), yellow text (#FFFF00) throughout

## Review Focus

1. **Rapid repeated taps on the same cell** — tapping a green bean twice before the shuffle completes should not double-count points. The cell should be disabled after the first tap (green/magic) or apply the score only once per shuffle cycle (red).
2. **Timer reaching 0 mid-magic-cycle** — if magic beans are visible when the timer expires, all taps should be disabled immediately. Magic beans should not linger or accept taps after game over.
3. **Grid shuffle producing the same layout** — Fisher-Yates shuffle should be used instead of `sort(() => Math.random() - 0.5)` which has distribution bias. The shuffle must never produce the identical arrangement (re-shuffle if unchanged).
4. **Level 2 button after level 2 game over** — the "LEVEL 2" button should still appear after a level 2 game ends (to replay level 2), matching the original behavior where both buttons always show.
5. **Web touch/click event handling** — `Pressable` must work correctly on both Android (touch) and web (mouse click). No platform-specific event handling needed if using `Pressable` correctly.

---

### Task 1: Project Scaffolding + Constants

**Files:**
- Create: `beanz-app/` (Expo project root via `create-expo-app`)
- Create: `beanz-app/constants/game.ts`
- Create: `beanz-app/constants/__tests__/game.test.ts`
- Modify: `beanz-app/tsconfig.json` (strict mode)
- Modify: `beanz-app/app.json` (app name, scheme)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `LEVELS`, `TIMER_DURATION`, `MAGIC_INTERVAL`, `MAGIC_VISIBLE_DURATION`, `POINTS` constants; `LevelConfig` and `Level` types

- [ ] **Step 1: Create Expo project**

```bash
cd /Users/phylliz.lee/Beanz
npx create-expo-app@latest beanz-app --template blank-typescript
cd beanz-app
```

- [ ] **Step 2: Install dependencies**

```bash
npx expo install expo-router expo-image expo-font expo-linking expo-constants expo-status-bar react-native-screens react-native-safe-area-context
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo @types/jest
```

- [ ] **Step 3: Configure expo-router in app.json**

Replace `beanz-app/app.json` with:

```json
{
  "expo": {
    "name": "Beanz",
    "slug": "beanz",
    "version": "1.0.0",
    "scheme": "beanz",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "web": {
      "bundler": "metro",
      "output": "single"
    },
    "plugins": ["expo-router", "expo-font"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 4: Enable strict TypeScript**

In `beanz-app/tsconfig.json`, ensure `strict` is `true`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 5: Configure Jest**

Add to `beanz-app/package.json`:

```json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
    ],
    "setupFilesAfterSetup": ["@testing-library/jest-native/extend-expect"]
  }
}
```

- [ ] **Step 6: Copy assets**

```bash
cp /Users/phylliz.lee/Beanz/assets/3dgifmaker89063.gif beanz-app/assets/
cp /Users/phylliz.lee/Beanz/assets/greenbean.gif beanz-app/assets/
cp /Users/phylliz.lee/Beanz/assets/greenSoil.png beanz-app/assets/
cp /Users/phylliz.lee/Beanz/assets/magicBeans.gif beanz-app/assets/
cp /Users/phylliz.lee/Beanz/assets/monster.gif beanz-app/assets/
cp /Users/phylliz.lee/Beanz/assets/newstar.png beanz-app/assets/
```

- [ ] **Step 7: Write constants test**

Create `beanz-app/constants/__tests__/game.test.ts`:

```ts
import { LEVELS, TIMER_DURATION, MAGIC_INTERVAL, MAGIC_VISIBLE_DURATION, POINTS } from '../game';

describe('game constants', () => {
  test('level 1 has 6x6 grid with 35% green', () => {
    expect(LEVELS[1]).toEqual({ gridSize: 6, greenPercent: 35, magicCount: 2 });
  });

  test('level 2 has 9x9 grid with 30% green', () => {
    expect(LEVELS[2]).toEqual({ gridSize: 9, greenPercent: 30, magicCount: 5 });
  });

  test('timer duration is 12 seconds', () => {
    expect(TIMER_DURATION).toBe(12);
  });

  test('magic beans appear every 5 seconds', () => {
    expect(MAGIC_INTERVAL).toBe(5);
  });

  test('magic beans visible for 2 seconds', () => {
    expect(MAGIC_VISIBLE_DURATION).toBe(2000);
  });

  test('green beans worth 5, red -3, magic 8', () => {
    expect(POINTS).toEqual({ green: 5, red: -3, magic: 8 });
  });
});
```

- [ ] **Step 8: Run test to verify it fails**

```bash
cd beanz-app && npx jest constants/__tests__/game.test.ts
```

Expected: FAIL — `constants/game` module not found.

- [ ] **Step 9: Write constants**

Create `beanz-app/constants/game.ts`:

```ts
export type Level = 1 | 2;

export interface LevelConfig {
  gridSize: number;
  greenPercent: number;
  magicCount: number;
}

export const LEVELS: Record<Level, LevelConfig> = {
  1: { gridSize: 6, greenPercent: 35, magicCount: 2 },
  2: { gridSize: 9, greenPercent: 30, magicCount: 5 },
};

export const TIMER_DURATION = 12;
export const MAGIC_INTERVAL = 5;
export const MAGIC_VISIBLE_DURATION = 2000;
export const POINTS = { green: 5, red: -3, magic: 8 } as const;
```

- [ ] **Step 10: Run test to verify it passes**

```bash
cd beanz-app && npx jest constants/__tests__/game.test.ts
```

Expected: PASS — all 6 tests green.

- [ ] **Step 11: Create expo-router layout**

Create `beanz-app/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

- [ ] **Step 12: Commit**

```bash
git add beanz-app/
git commit -m "feat: scaffold Expo project with constants and routing"
```

---

### Task 2: useGame Hook — Grid Generation + Scoring

**Files:**
- Create: `beanz-app/hooks/useGame.ts`
- Create: `beanz-app/hooks/__tests__/useGame.test.ts`

**Interfaces:**
- Consumes: `LEVELS`, `TIMER_DURATION`, `MAGIC_INTERVAL`, `MAGIC_VISIBLE_DURATION`, `POINTS`, `Level`, `LevelConfig` from `constants/game`
- Produces: `Cell` type, `useGame(level)` hook returning `{ score, timeLeft, isRunning, grid, startGame, tapCell, isGameOver }`

- [ ] **Step 1: Write failing tests for grid generation**

Create `beanz-app/hooks/__tests__/useGame.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react-native';
import { useGame } from '../useGame';
import { LEVELS, POINTS } from '../../constants/game';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useGame - grid generation', () => {
  test('generates correct number of cells for level 1', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    expect(result.current.grid).toHaveLength(36);
  });

  test('generates correct number of cells for level 2', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(2); });
    expect(result.current.grid).toHaveLength(81);
  });

  test('level 1 grid has ~35% green beans', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCount = result.current.grid.filter(c => c.type === 'green').length;
    expect(greenCount).toBe(Math.floor((36 / 100) * 35));
  });

  test('level 2 grid has ~30% green beans', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(2); });
    const greenCount = result.current.grid.filter(c => c.type === 'green').length;
    expect(greenCount).toBe(Math.floor((81 / 100) * 30));
  });

  test('remaining cells are red', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCount = result.current.grid.filter(c => c.type === 'green').length;
    const redCount = result.current.grid.filter(c => c.type === 'red').length;
    expect(greenCount + redCount).toBe(36);
  });

  test('all cells start untapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    expect(result.current.grid.every(c => !c.tapped)).toBe(true);
  });

  test('each cell has a unique id', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const ids = result.current.grid.map(c => c.id);
    expect(new Set(ids).size).toBe(36);
  });
});

describe('useGame - scoring', () => {
  test('score starts at 0', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    expect(result.current.score).toBe(0);
  });

  test('tapping green bean adds 5 points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCell = result.current.grid.find(c => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
  });

  test('tapping red bean subtracts 3 points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const redCell = result.current.grid.find(c => c.type === 'red')!;
    act(() => { result.current.tapCell(redCell.id); });
    expect(result.current.score).toBe(POINTS.red);
  });

  test('tapping green bean marks it as tapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCell = result.current.grid.find(c => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    const tappedCell = result.current.grid.find(c => c.id === greenCell.id)!;
    expect(tappedCell.tapped).toBe(true);
  });

  test('tapping already-tapped green bean does not add points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCell = result.current.grid.find(c => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
  });

  test('grid is shuffled after each tap', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const orderBefore = result.current.grid.map(c => c.id);
    const greenCell = result.current.grid.find(c => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    const orderAfter = result.current.grid.map(c => c.id);
    // Very unlikely to be identical after shuffle (1 in 36! chance)
    expect(orderAfter).not.toEqual(orderBefore);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd beanz-app && npx jest hooks/__tests__/useGame.test.ts
```

Expected: FAIL — `hooks/useGame` module not found.

- [ ] **Step 3: Implement useGame hook — grid generation + scoring + shuffle**

Create `beanz-app/hooks/useGame.ts`:

```ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { LEVELS, TIMER_DURATION, MAGIC_INTERVAL, MAGIC_VISIBLE_DURATION, POINTS } from '../constants/game';
import type { Level } from '../constants/game';

export interface Cell {
  id: string;
  type: 'green' | 'red' | 'magic';
  tapped: boolean;
  originalType?: 'green' | 'red';
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildGrid(level: Level): Cell[] {
  const config = LEVELS[level];
  const total = config.gridSize * config.gridSize;
  const numGreen = Math.floor((total / 100) * config.greenPercent);

  const cells: Cell[] = [];
  for (let i = 0; i < total; i++) {
    cells.push({
      id: `cell-${i}`,
      type: i < numGreen ? 'green' : 'red',
      tapped: false,
    });
  }
  return shuffle(cells);
}

export function useGame() {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [level, setLevel] = useState<Level>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const magicTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGameOver = !isRunning && timeLeft === 0;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (magicTimeoutRef.current) {
      clearTimeout(magicTimeoutRef.current);
      magicTimeoutRef.current = null;
    }
  }, []);

  const applyMagic = useCallback((currentGrid: Cell[], level: Level): Cell[] => {
    const config = LEVELS[level];
    const newGrid = currentGrid.map(c => ({ ...c }));
    const nonMagicIndices = newGrid
      .map((c, i) => (c.type !== 'magic' ? i : -1))
      .filter(i => i >= 0);
    const chosen = shuffle(nonMagicIndices).slice(0, config.magicCount);

    for (const idx of chosen) {
      newGrid[idx] = {
        ...newGrid[idx],
        originalType: newGrid[idx].type as 'green' | 'red',
        type: 'magic',
      };
    }
    return newGrid;
  }, []);

  const removeMagic = useCallback((currentGrid: Cell[]): Cell[] => {
    return currentGrid.map(c => {
      if (c.type === 'magic' && c.originalType) {
        return { ...c, type: c.originalType, originalType: undefined };
      }
      return c;
    });
  }, []);

  const startGame = useCallback((newLevel: Level = 1) => {
    clearTimers();
    setLevel(newLevel);
    setScore(0);
    setTimeLeft(TIMER_DURATION);
    setGrid(buildGrid(newLevel));
    setIsRunning(true);
  }, [clearTimers]);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimers();
          setIsRunning(false);
          setGrid(g => removeMagic(g));
          return 0;
        }

        if ((prev - 1) % MAGIC_INTERVAL === 0 && prev - 1 > 0) {
          setGrid(g => {
            const withMagic = applyMagic(g, level);
            magicTimeoutRef.current = setTimeout(() => {
              setGrid(current => removeMagic(current));
            }, MAGIC_VISIBLE_DURATION);
            return withMagic;
          });
        }

        return prev - 1;
      });
    }, 1000);

    return () => { clearTimers(); };
  }, [isRunning, level, clearTimers, applyMagic, removeMagic]);

  const tapCell = useCallback((id: string) => {
    if (!isRunning) return;

    setGrid(prevGrid => {
      const cellIndex = prevGrid.findIndex(c => c.id === id);
      if (cellIndex === -1) return prevGrid;

      const cell = prevGrid[cellIndex];

      if (cell.type === 'green' && cell.tapped) return prevGrid;
      if (cell.type === 'magic' && cell.tapped) return prevGrid;

      let pointDelta = 0;
      let updatedCell: Cell;

      switch (cell.type) {
        case 'green':
          pointDelta = POINTS.green;
          updatedCell = { ...cell, tapped: true };
          break;
        case 'red':
          pointDelta = POINTS.red;
          updatedCell = { ...cell, tapped: true };
          setTimeout(() => {
            setGrid(g => {
              const idx = g.findIndex(c => c.id === id);
              if (idx === -1) return g;
              const newGrid = [...g];
              newGrid[idx] = { ...newGrid[idx], tapped: false };
              return newGrid;
            });
          }, 500);
          break;
        case 'magic':
          pointDelta = POINTS.magic;
          updatedCell = { ...cell, tapped: true };
          break;
        default:
          return prevGrid;
      }

      setScore(s => s + pointDelta);
      const newGrid = [...prevGrid];
      newGrid[cellIndex] = updatedCell;
      return shuffle(newGrid);
    });
  }, [isRunning]);

  return { score, timeLeft, isRunning, grid, startGame, tapCell, isGameOver, level };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd beanz-app && npx jest hooks/__tests__/useGame.test.ts
```

Expected: PASS — all tests green.

- [ ] **Step 5: Write failing tests for timer + magic beans**

Append to `beanz-app/hooks/__tests__/useGame.test.ts`:

```ts
describe('useGame - timer', () => {
  test('timer starts at TIMER_DURATION after startGame', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    expect(result.current.timeLeft).toBe(12);
    expect(result.current.isRunning).toBe(true);
  });

  test('timer decrements each second', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.timeLeft).toBe(11);
  });

  test('game ends when timer reaches 0', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(12000); });
    expect(result.current.timeLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isGameOver).toBe(true);
  });

  test('tapping is ignored after game over', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(12000); });
    const scoreBefore = result.current.score;
    const greenCell = result.current.grid.find(c => c.type === 'green' && !c.tapped);
    if (greenCell) {
      act(() => { result.current.tapCell(greenCell.id); });
    }
    expect(result.current.score).toBe(scoreBefore);
  });
});

describe('useGame - magic beans', () => {
  test('magic beans appear at magic interval', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    // Timer goes from 12 to 7 — at 10 (12-2) and then 5 (12-7)
    // Magic at timeLeft % 5 === 0, so at timeLeft=10, timeLeft=5
    act(() => { jest.advanceTimersByTime(2000); });
    // timeLeft = 10, which is divisible by 5
    const magicCount = result.current.grid.filter(c => c.type === 'magic').length;
    expect(magicCount).toBeGreaterThan(0);
  });

  test('magic beans disappear after MAGIC_VISIBLE_DURATION', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(2000); });
    const hadMagic = result.current.grid.some(c => c.type === 'magic');
    expect(hadMagic).toBe(true);
    act(() => { jest.advanceTimersByTime(2000); });
    const hasMagic = result.current.grid.some(c => c.type === 'magic');
    expect(hasMagic).toBe(false);
  });

  test('tapping magic bean adds 8 points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(2000); });
    const magicCell = result.current.grid.find(c => c.type === 'magic');
    if (magicCell) {
      act(() => { result.current.tapCell(magicCell.id); });
      expect(result.current.score).toBe(POINTS.magic);
    }
  });
});
```

- [ ] **Step 6: Run all hook tests**

```bash
cd beanz-app && npx jest hooks/__tests__/useGame.test.ts
```

Expected: PASS — all tests green (implementation already handles timer + magic).

- [ ] **Step 7: Add Review Focus tests — rapid double-tap and timer-during-magic**

Append to `beanz-app/hooks/__tests__/useGame.test.ts`:

```ts
describe('useGame - edge cases', () => {
  test('rapid double-tap on green does not double-count', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCell = result.current.grid.find(c => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
  });

  test('game over during magic cycle disables all taps', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    // Advance to near end, trigger magic at t=5
    act(() => { jest.advanceTimersByTime(7000); });
    // Now advance past game over
    act(() => { jest.advanceTimersByTime(5000); });
    expect(result.current.isGameOver).toBe(true);
    const anyCell = result.current.grid[0];
    const scoreBefore = result.current.score;
    act(() => { result.current.tapCell(anyCell.id); });
    expect(result.current.score).toBe(scoreBefore);
  });
});
```

- [ ] **Step 8: Run all tests**

```bash
cd beanz-app && npx jest hooks/__tests__/useGame.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add beanz-app/hooks/
git commit -m "feat: implement useGame hook with grid, scoring, timer, and magic beans"
```

---

### Task 3: BeanCell + BeanGrid Components

**Files:**
- Create: `beanz-app/components/BeanCell.tsx`
- Create: `beanz-app/components/BeanGrid.tsx`
- Create: `beanz-app/components/__tests__/BeanCell.test.tsx`
- Create: `beanz-app/components/__tests__/BeanGrid.test.tsx`

**Interfaces:**
- Consumes: `Cell` type from `hooks/useGame`
- Produces: `<BeanCell cell={Cell} size={number} onTap={(id: string) => void} disabled={boolean} />`, `<BeanGrid grid={Cell[]} gridSize={number} onTap={(id: string) => void} disabled={boolean} />`

- [ ] **Step 1: Write failing BeanCell tests**

Create `beanz-app/components/__tests__/BeanCell.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BeanCell } from '../BeanCell';
import type { Cell } from '../../hooks/useGame';

const makeCell = (overrides: Partial<Cell> = {}): Cell => ({
  id: 'cell-0',
  type: 'green',
  tapped: false,
  ...overrides,
});

describe('BeanCell', () => {
  const onTap = jest.fn();

  beforeEach(() => { onTap.mockClear(); });

  test('calls onTap with cell id when pressed', () => {
    const cell = makeCell();
    const { getByTestId } = render(
      <BeanCell cell={cell} size={50} onTap={onTap} disabled={false} />
    );
    fireEvent.press(getByTestId(`bean-${cell.id}`));
    expect(onTap).toHaveBeenCalledWith('cell-0');
  });

  test('does not call onTap when disabled', () => {
    const cell = makeCell();
    const { getByTestId } = render(
      <BeanCell cell={cell} size={50} onTap={onTap} disabled={true} />
    );
    fireEvent.press(getByTestId(`bean-${cell.id}`));
    expect(onTap).not.toHaveBeenCalled();
  });

  test('renders with correct size', () => {
    const cell = makeCell();
    const { getByTestId } = render(
      <BeanCell cell={cell} size={80} onTap={onTap} disabled={false} />
    );
    const element = getByTestId(`bean-${cell.id}`);
    expect(element.props.style).toEqual(
      expect.objectContaining({ width: 80, height: 80 })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd beanz-app && npx jest components/__tests__/BeanCell.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement BeanCell**

Create `beanz-app/components/BeanCell.tsx`:

```tsx
import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { Cell } from '../hooks/useGame';

const BEAN_IMAGES = {
  green: require('../assets/greenbean.gif'),
  greenTapped: require('../assets/greenSoil.png'),
  red: require('../assets/3dgifmaker89063.gif'),
  redTapped: require('../assets/monster.gif'),
  magic: require('../assets/magicBeans.gif'),
  magicTapped: require('../assets/newstar.png'),
} as const;

function getImage(cell: Cell) {
  if (cell.tapped) {
    switch (cell.type) {
      case 'green': return BEAN_IMAGES.greenTapped;
      case 'red': return BEAN_IMAGES.redTapped;
      case 'magic': return BEAN_IMAGES.magicTapped;
    }
  }
  return BEAN_IMAGES[cell.type];
}

interface BeanCellProps {
  cell: Cell;
  size: number;
  onTap: (id: string) => void;
  disabled: boolean;
}

export const BeanCell = memo(function BeanCell({ cell, size, onTap, disabled }: BeanCellProps) {
  return (
    <Pressable
      testID={`bean-${cell.id}`}
      onPress={() => onTap(cell.id)}
      disabled={disabled}
      style={[styles.cell, { width: size, height: size }]}
    >
      <Image
        source={getImage(cell)}
        style={styles.image}
        contentFit="cover"
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
```

- [ ] **Step 4: Run BeanCell tests**

```bash
cd beanz-app && npx jest components/__tests__/BeanCell.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing BeanGrid tests**

Create `beanz-app/components/__tests__/BeanGrid.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BeanGrid } from '../BeanGrid';
import type { Cell } from '../../hooks/useGame';

function makeCells(count: number): Cell[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `cell-${i}`,
    type: i % 2 === 0 ? 'green' as const : 'red' as const,
    tapped: false,
  }));
}

describe('BeanGrid', () => {
  const onTap = jest.fn();

  beforeEach(() => { onTap.mockClear(); });

  test('renders correct number of cells', () => {
    const cells = makeCells(36);
    const { getAllByTestId } = render(
      <BeanGrid grid={cells} gridSize={6} onTap={onTap} disabled={false} />
    );
    expect(getAllByTestId(/^bean-cell-/)).toHaveLength(36);
  });

  test('passes onTap through to cells', () => {
    const cells = makeCells(4);
    const { getByTestId } = render(
      <BeanGrid grid={cells} gridSize={2} onTap={onTap} disabled={false} />
    );
    fireEvent.press(getByTestId('bean-cell-0'));
    expect(onTap).toHaveBeenCalledWith('cell-0');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd beanz-app && npx jest components/__tests__/BeanGrid.test.tsx
```

Expected: FAIL.

- [ ] **Step 7: Implement BeanGrid**

Create `beanz-app/components/BeanGrid.tsx`:

```tsx
import React, { memo } from 'react';
import { FlatList, useWindowDimensions, StyleSheet, View } from 'react-native';
import { BeanCell } from './BeanCell';
import type { Cell } from '../hooks/useGame';

interface BeanGridProps {
  grid: Cell[];
  gridSize: number;
  onTap: (id: string) => void;
  disabled: boolean;
}

export const BeanGrid = memo(function BeanGrid({ grid, gridSize, onTap, disabled }: BeanGridProps) {
  const { width } = useWindowDimensions();
  const gridWidth = Math.min(width - 32, 500);
  const cellSize = gridWidth / gridSize;

  return (
    <View style={[styles.container, { width: gridWidth }]}>
      <FlatList
        key={gridSize}
        data={grid}
        numColumns={gridSize}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <BeanCell cell={item} size={cellSize} onTap={onTap} disabled={disabled} />
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
```

- [ ] **Step 8: Run all component tests**

```bash
cd beanz-app && npx jest components/__tests__/
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add beanz-app/components/
git commit -m "feat: add BeanCell and BeanGrid components"
```

---

### Task 4: ScoreBoard + GameOverPanel Components

**Files:**
- Create: `beanz-app/components/ScoreBoard.tsx`
- Create: `beanz-app/components/GameOverPanel.tsx`
- Create: `beanz-app/components/__tests__/ScoreBoard.test.tsx`
- Create: `beanz-app/components/__tests__/GameOverPanel.test.tsx`

**Interfaces:**
- Consumes: nothing beyond standard React Native primitives
- Produces: `<ScoreBoard timeLeft={number} score={number} isRunning={boolean} onStart={() => void} />`, `<GameOverPanel score={number} onPlayAgain={() => void} onLevel2={() => void} />`

- [ ] **Step 1: Write failing ScoreBoard tests**

Create `beanz-app/components/__tests__/ScoreBoard.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ScoreBoard } from '../ScoreBoard';

describe('ScoreBoard', () => {
  test('shows START button when not running', () => {
    const onStart = jest.fn();
    const { getByText } = render(
      <ScoreBoard timeLeft={12} score={0} isRunning={false} onStart={onStart} />
    );
    fireEvent.press(getByText('START'));
    expect(onStart).toHaveBeenCalled();
  });

  test('hides START button when running', () => {
    const { queryByText } = render(
      <ScoreBoard timeLeft={10} score={5} isRunning={true} onStart={jest.fn()} />
    );
    expect(queryByText('START')).toBeNull();
  });

  test('displays timer and score when running', () => {
    const { getByText } = render(
      <ScoreBoard timeLeft={8} score={15} isRunning={true} onStart={jest.fn()} />
    );
    expect(getByText('8')).toBeTruthy();
    expect(getByText(/15/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd beanz-app && npx jest components/__tests__/ScoreBoard.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement ScoreBoard**

Create `beanz-app/components/ScoreBoard.tsx`:

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ScoreBoardProps {
  timeLeft: number;
  score: number;
  isRunning: boolean;
  onStart: () => void;
}

export function ScoreBoard({ timeLeft, score, isRunning, onStart }: ScoreBoardProps) {
  return (
    <View style={styles.container}>
      {isRunning ? (
        <>
          <Text style={styles.timer}>{timeLeft}</Text>
          <Text style={styles.score}>YOUR SCORE: {score}</Text>
        </>
      ) : (
        <Pressable style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>START</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  score: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 4: Run ScoreBoard tests**

```bash
cd beanz-app && npx jest components/__tests__/ScoreBoard.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing GameOverPanel tests**

Create `beanz-app/components/__tests__/GameOverPanel.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameOverPanel } from '../GameOverPanel';

describe('GameOverPanel', () => {
  const onPlayAgain = jest.fn();
  const onLevel2 = jest.fn();

  beforeEach(() => {
    onPlayAgain.mockClear();
    onLevel2.mockClear();
  });

  test('displays final score', () => {
    const { getByText } = render(
      <GameOverPanel score={42} onPlayAgain={onPlayAgain} onLevel2={onLevel2} />
    );
    expect(getByText(/42/)).toBeTruthy();
  });

  test('PLAY AGAIN button calls onPlayAgain', () => {
    const { getByText } = render(
      <GameOverPanel score={10} onPlayAgain={onPlayAgain} onLevel2={onLevel2} />
    );
    fireEvent.press(getByText('PLAY AGAIN'));
    expect(onPlayAgain).toHaveBeenCalled();
  });

  test('LEVEL 2 button calls onLevel2', () => {
    const { getByText } = render(
      <GameOverPanel score={10} onPlayAgain={onPlayAgain} onLevel2={onLevel2} />
    );
    fireEvent.press(getByText('LEVEL 2'));
    expect(onLevel2).toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd beanz-app && npx jest components/__tests__/GameOverPanel.test.tsx
```

Expected: FAIL.

- [ ] **Step 7: Implement GameOverPanel**

Create `beanz-app/components/GameOverPanel.tsx`:

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface GameOverPanelProps {
  score: number;
  onPlayAgain: () => void;
  onLevel2: () => void;
}

export function GameOverPanel({ score, onPlayAgain, onLevel2 }: GameOverPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.doneText}>DONE!</Text>
      <Text style={styles.scoreText}>YOUR SCORE: {score}</Text>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={onPlayAgain}>
          <Text style={styles.buttonText}>PLAY AGAIN</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onLevel2}>
          <Text style={styles.buttonText}>LEVEL 2</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  doneText: {
    color: '#FFFF00',
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 8: Run all component tests**

```bash
cd beanz-app && npx jest components/__tests__/
```

Expected: PASS — all tests green.

- [ ] **Step 9: Commit**

```bash
git add beanz-app/components/ScoreBoard.tsx beanz-app/components/GameOverPanel.tsx beanz-app/components/__tests__/ScoreBoard.test.tsx beanz-app/components/__tests__/GameOverPanel.test.tsx
git commit -m "feat: add ScoreBoard and GameOverPanel components"
```

---

### Task 5: Screens — Splash, Instructions, Game

**Files:**
- Create: `beanz-app/app/index.tsx` (SplashScreen)
- Create: `beanz-app/app/instructions.tsx` (InstructionsScreen)
- Create: `beanz-app/app/game.tsx` (GameScreen)
- Create: `beanz-app/app/__tests__/index.test.tsx`
- Create: `beanz-app/app/__tests__/instructions.test.tsx`
- Create: `beanz-app/app/__tests__/game.test.tsx`

**Interfaces:**
- Consumes: `useGame` hook, `BeanGrid`, `ScoreBoard`, `GameOverPanel` components, `expo-router` navigation
- Produces: complete navigable app screens

- [ ] **Step 1: Write failing SplashScreen test**

Create `beanz-app/app/__tests__/index.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SplashScreen from '../index';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('SplashScreen', () => {
  beforeEach(() => { mockPush.mockClear(); });

  test('renders title', () => {
    const { getByText } = render(<SplashScreen />);
    expect(getByText('ARE YOU READY FOR BEANZ')).toBeTruthy();
  });

  test('PLAY NOW navigates to instructions', () => {
    const { getByText } = render(<SplashScreen />);
    fireEvent.press(getByText('PLAY NOW'));
    expect(mockPush).toHaveBeenCalledWith('/instructions');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd beanz-app && npx jest app/__tests__/index.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement SplashScreen**

Write `beanz-app/app/index.tsx`:

```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARE YOU READY FOR BEANZ</Text>
      <Pressable style={styles.button} onPress={() => router.push('/instructions')}>
        <Text style={styles.buttonText}>PLAY NOW</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFF00',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 4: Run test**

```bash
cd beanz-app && npx jest app/__tests__/index.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing InstructionsScreen test**

Create `beanz-app/app/__tests__/instructions.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InstructionsScreen from '../instructions';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('InstructionsScreen', () => {
  beforeEach(() => { mockPush.mockClear(); });

  test('renders instructions heading', () => {
    const { getByText } = render(<InstructionsScreen />);
    expect(getByText('INSTRUCTIONS')).toBeTruthy();
  });

  test('mentions green beans, red beans, and magic beans', () => {
    const { getByText } = render(<InstructionsScreen />);
    expect(getByText(/Green Bean/i)).toBeTruthy();
    expect(getByText(/Red Bean/i)).toBeTruthy();
    expect(getByText(/Magic Bean/i)).toBeTruthy();
  });

  test('PLAY NOW navigates to game', () => {
    const { getByText } = render(<InstructionsScreen />);
    fireEvent.press(getByText('PLAY NOW'));
    expect(mockPush).toHaveBeenCalledWith('/game');
  });
});
```

- [ ] **Step 6: Implement InstructionsScreen**

Write `beanz-app/app/instructions.tsx`:

```tsx
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function InstructionsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>INSTRUCTIONS</Text>

      <View style={styles.rule}>
        <Text style={styles.text}>
          Tap on as many Green Beans{' '}
        </Text>
        <Image source={require('../assets/greenbean.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          {' '}as possible while avoiding the Red Beans{' '}
        </Text>
        <Image source={require('../assets/3dgifmaker89063.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          ! If you spot the Magic Beans{' '}
        </Text>
        <Image source={require('../assets/magicBeans.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          , act fast and tap them for bonus points!
        </Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Green Bean → Sprout{' '}
        </Text>
        <Image source={require('../assets/greenSoil.png')} style={styles.inlineImage} />
        <Text style={styles.text}> = +5 points</Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Magic Bean → Star{' '}
        </Text>
        <Image source={require('../assets/newstar.png')} style={styles.inlineImage} />
        <Text style={styles.text}> = +8 points</Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Red Bean → Monster{' '}
        </Text>
        <Image source={require('../assets/monster.gif')} style={styles.inlineImage} />
        <Text style={styles.text}> = -3 points</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.push('/game')}>
        <Text style={styles.buttonText}>PLAY NOW</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFF00',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  rule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scoring: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    color: '#FFFF00',
    fontSize: 16,
  },
  inlineImage: {
    width: 30,
    height: 30,
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  buttonText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 7: Run test**

```bash
cd beanz-app && npx jest app/__tests__/instructions.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Write failing GameScreen test**

Create `beanz-app/app/__tests__/game.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameScreen from '../game';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('GameScreen', () => {
  test('renders START button initially', () => {
    const { getByText } = render(<GameScreen />);
    expect(getByText('START')).toBeTruthy();
  });

  test('shows game grid after pressing START', () => {
    const { getByText, getAllByTestId } = render(<GameScreen />);
    fireEvent.press(getByText('START'));
    const cells = getAllByTestId(/^bean-cell-/);
    expect(cells.length).toBe(36);
  });

  test('shows BEANZ title', () => {
    const { getByText } = render(<GameScreen />);
    expect(getByText('BEANZ')).toBeTruthy();
  });
});
```

- [ ] **Step 9: Implement GameScreen**

Write `beanz-app/app/game.tsx`:

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { useGame } from '../hooks/useGame';
import { BeanGrid } from '../components/BeanGrid';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameOverPanel } from '../components/GameOverPanel';
import { LEVELS } from '../constants/game';

export default function GameScreen() {
  const { score, timeLeft, isRunning, grid, startGame, tapCell, isGameOver, level } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BEANZ</Text>

      {isGameOver ? (
        <GameOverPanel
          score={score}
          onPlayAgain={() => startGame(1)}
          onLevel2={() => startGame(2)}
        />
      ) : (
        <ScoreBoard
          timeLeft={timeLeft}
          score={score}
          isRunning={isRunning}
          onStart={() => startGame(level)}
        />
      )}

      <BeanGrid
        grid={grid}
        gridSize={LEVELS[level].gridSize}
        onTap={tapCell}
        disabled={isGameOver || !isRunning}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 48,
  },
  title: {
    color: '#FFFF00',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
```

- [ ] **Step 10: Run all screen tests**

```bash
cd beanz-app && npx jest app/__tests__/
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add beanz-app/app/
git commit -m "feat: add Splash, Instructions, and Game screens"
```

---

### Task 6: Font Loading + Final Polish

**Files:**
- Modify: `beanz-app/app/_layout.tsx` (add font loading)
- Modify: `beanz-app/app/index.tsx` (use PacFont)
- Modify: `beanz-app/app/game.tsx` (use PacFont for title)

**Interfaces:**
- Consumes: PacFont font file, `expo-font`
- Produces: complete styled app matching original visual design

- [ ] **Step 1: Download PacFont**

The original uses PacFont from cdnfonts. Download the TTF file:

```bash
cd beanz-app/assets/fonts && mkdir -p . 
curl -L -o beanz-app/assets/fonts/PacFont.ttf "https://fonts.cdnfonts.com/s/15279/pac-font.woff" 2>/dev/null || echo "Download PacFont manually to beanz-app/assets/fonts/PacFont.ttf"
```

If the download fails, the font file needs to be sourced manually. The app will fall back to system font.

- [ ] **Step 2: Update _layout.tsx to load fonts**

Replace `beanz-app/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PacFont: require('../assets/fonts/PacFont.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

- [ ] **Step 3: Apply PacFont to titles**

In `beanz-app/app/index.tsx`, update the title style:

```ts
  title: {
    color: '#FFFF00',
    fontSize: 36,
    fontFamily: 'PacFont',
    textAlign: 'center',
    marginBottom: 40,
  },
```

In `beanz-app/app/game.tsx`, update the title style:

```ts
  title: {
    color: '#FFFF00',
    fontSize: 48,
    fontFamily: 'PacFont',
    textAlign: 'center',
  },
```

- [ ] **Step 4: Run the full test suite**

```bash
cd beanz-app && npx jest --coverage
```

Expected: All tests pass.

- [ ] **Step 5: Start the dev server and test on web**

```bash
cd beanz-app && npx expo start --web
```

Verify in browser:
- Splash screen shows with title and PLAY NOW button
- Instructions screen shows rules with inline bean images
- Game screen: START button works, grid appears, beans are tappable
- Timer counts down, score updates on taps
- Grid shuffles after each tap
- Game over shows score + PLAY AGAIN / LEVEL 2 buttons
- PLAY AGAIN restarts level 1, LEVEL 2 starts 9x9 grid

- [ ] **Step 6: Commit**

```bash
git add beanz-app/
git commit -m "feat: add PacFont loading and final styling"
```

---

### Task 7: Android Build Configuration

**Files:**
- Modify: `beanz-app/app.json` (add Android-specific config)
- Create: `beanz-app/eas.json` (EAS Build configuration)

**Interfaces:**
- Consumes: complete working app from Tasks 1-6
- Produces: buildable Android APK/AAB via `eas build`

- [ ] **Step 1: Update app.json with Android config**

Add to the `expo` object in `beanz-app/app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.beanz.game",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      }
    }
  }
}
```

- [ ] **Step 2: Create EAS configuration**

Create `beanz-app/eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      }
    }
  }
}
```

- [ ] **Step 3: Install EAS CLI globally**

```bash
npm install -g eas-cli
```

- [ ] **Step 4: Run a local preview build to verify config**

```bash
cd beanz-app && npx expo prebuild --platform android --clean
```

Verify: `android/` directory is generated without errors.

- [ ] **Step 5: Clean up prebuild artifacts**

```bash
cd beanz-app && rm -rf android/
```

The actual build will be done via `eas build --platform android --profile preview` when ready to deploy.

- [ ] **Step 6: Commit**

```bash
git add beanz-app/app.json beanz-app/eas.json
git commit -m "feat: add Android build configuration for EAS"
```
