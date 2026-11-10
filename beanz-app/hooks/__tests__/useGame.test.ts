import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useGame } from '../useGame';
import { POINTS, MAX_WAVE, getWaveConfig, getWaveTimer, GREEN_THRESHOLD } from '../../constants/game';
import type { Cell } from '../useGame';
import type { GamePhase } from '../useGame';

const { act } = ReactTestRenderer;

interface HookResult<T> {
  current: T;
}

function renderHook<T>(hookFn: () => T): { result: HookResult<T> } {
  const result: HookResult<T> = { current: undefined as T };
  function TestComponent() {
    result.current = hookFn();
    return null;
  }
  act(() => {
    ReactTestRenderer.create(React.createElement(TestComponent));
  });
  return { result };
}

function tapGreens(result: HookResult<ReturnType<typeof useGame>>, count: number) {
  for (let i = 0; i < count; i++) {
    const green = result.current.grid.find((c: Cell) => c.type === 'green' && !c.tapped);
    if (!green) break;
    act(() => { result.current.tapCell(green.id); });
  }
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useGame - initial state', () => {
  test('starts in idle phase at wave 1', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.gamePhase).toBe('idle');
    expect(result.current.wave).toBe(1);
    expect(result.current.score).toBe(0);
    expect(result.current.waveScore).toBe(0);
    expect(result.current.greensTapped).toBe(0);
    expect(result.current.totalGreens).toBe(0);
  });
});

describe('useGame - grid generation', () => {
  test('wave 1 generates a 5x5 grid (25 cells)', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    expect(result.current.grid).toHaveLength(25);
  });

  test('wave 1 grid has ~40% green beans', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const greenCount = result.current.grid.filter((c: Cell) => c.type === 'green').length;
    expect(greenCount).toBe(Math.floor((25 / 100) * 40));
  });

  test('totalGreens matches green cells in grid', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const greenCount = result.current.grid.filter((c: Cell) => c.type === 'green').length;
    expect(result.current.totalGreens).toBe(greenCount);
  });

  test('remaining cells are red', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const greenCount = result.current.grid.filter((c: Cell) => c.type === 'green').length;
    const redCount = result.current.grid.filter((c: Cell) => c.type === 'red').length;
    expect(greenCount + redCount).toBe(25);
  });

  test('all cells start untapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    expect(result.current.grid.every((c: Cell) => !c.tapped)).toBe(true);
  });

  test('each cell has a unique id', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const ids = result.current.grid.map((c: Cell) => c.id);
    expect(new Set(ids).size).toBe(25);
  });
});

describe('useGame - scoring', () => {
  test('score starts at 0', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    expect(result.current.score).toBe(0);
    expect(result.current.waveScore).toBe(0);
  });

  test('tapping green bean adds 5 points and increments greensTapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
    expect(result.current.waveScore).toBe(POINTS.green);
    expect(result.current.greensTapped).toBe(1);
  });

  test('tapping red bean subtracts 3 points and does not increment greensTapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const redCell = result.current.grid.find((c: Cell) => c.type === 'red')!;
    act(() => { result.current.tapCell(redCell.id); });
    expect(result.current.score).toBe(POINTS.red);
    expect(result.current.greensTapped).toBe(0);
  });

  test('tapping green bean marks it as tapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    const tappedCell = result.current.grid.find((c: Cell) => c.id === greenCell.id)!;
    expect(tappedCell.tapped).toBe(true);
  });

  test('tapping already-tapped green bean does not add points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
    expect(result.current.greensTapped).toBe(1);
  });

  test('grid is shuffled after each tap', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const orderBefore = result.current.grid.map((c: Cell) => c.id);
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    const orderAfter = result.current.grid.map((c: Cell) => c.id);
    expect(orderAfter).not.toEqual(orderBefore);
  });
});

describe('useGame - timer', () => {
  test('wave 1 timer starts at 12', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    expect(result.current.timeLeft).toBe(12);
    expect(result.current.gamePhase).toBe('playing');
  });

  test('timer decrements each second', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.timeLeft).toBe(11);
  });

  test('tapping is ignored when not playing', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    act(() => { jest.advanceTimersByTime(12000); });
    const scoreBefore = result.current.score;
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green' && !c.tapped);
    if (greenCell) {
      act(() => { result.current.tapCell(greenCell.id); });
    }
    expect(result.current.score).toBe(scoreBefore);
  });
});

describe('useGame - magic beans', () => {
  test('magic beans appear at magic interval', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    act(() => { jest.advanceTimersByTime(2000); });
    const magicCount = result.current.grid.filter((c: Cell) => c.type === 'magic').length;
    expect(magicCount).toBeGreaterThan(0);
  });

  test('magic beans disappear after 2 seconds', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    act(() => { jest.advanceTimersByTime(2000); });
    const hadMagic = result.current.grid.some((c: Cell) => c.type === 'magic');
    expect(hadMagic).toBe(true);
    act(() => { jest.advanceTimersByTime(2000); });
    const hasMagic = result.current.grid.some((c: Cell) => c.type === 'magic');
    expect(hasMagic).toBe(false);
  });

  test('tapping magic bean adds 8 points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    act(() => { jest.advanceTimersByTime(2000); });
    const magicCell = result.current.grid.find((c: Cell) => c.type === 'magic');
    if (magicCell) {
      act(() => { result.current.tapCell(magicCell.id); });
      expect(result.current.score).toBe(POINTS.magic);
    }
  });
});

describe('useGame - wave progression (green threshold)', () => {
  test('wave complete when >= 50% greens tapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const needed = Math.ceil(result.current.totalGreens * GREEN_THRESHOLD);
    tapGreens(result, needed);
    expect(result.current.greensTapped).toBeGreaterThanOrEqual(needed);
    act(() => { jest.advanceTimersByTime(12000); });
    expect(result.current.gamePhase).toBe('wave-complete');
  });

  test('game over when < 50% greens tapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const needed = Math.ceil(result.current.totalGreens * GREEN_THRESHOLD);
    tapGreens(result, needed - 1);
    act(() => { jest.advanceTimersByTime(12000); });
    expect(result.current.gamePhase).toBe('game-over');
  });

  test('game over when no greens tapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    act(() => { jest.advanceTimersByTime(12000); });
    expect(result.current.gamePhase).toBe('game-over');
  });

  test('nextWave advances to wave 2 with larger grid and fresh timer', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const needed = Math.ceil(result.current.totalGreens * GREEN_THRESHOLD);
    tapGreens(result, needed);
    act(() => { jest.advanceTimersByTime(12000); });

    const scoreBefore = result.current.score;
    act(() => { result.current.nextWave(); });
    expect(result.current.wave).toBe(2);
    expect(result.current.gamePhase).toBe('playing');
    expect(result.current.grid).toHaveLength(36);
    expect(result.current.score).toBe(scoreBefore);
    expect(result.current.waveScore).toBe(0);
    expect(result.current.greensTapped).toBe(0);
    expect(result.current.timeLeft).toBe(getWaveTimer(2));
  });

  test('cumulative score carries across waves', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const needed = Math.ceil(result.current.totalGreens * GREEN_THRESHOLD);
    tapGreens(result, needed);
    const scoreAfterWave1 = result.current.score;
    act(() => { jest.advanceTimersByTime(12000); });
    act(() => { result.current.nextWave(); });

    const g2 = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(g2.id); });
    expect(result.current.score).toBe(scoreAfterWave1 + POINTS.green);
  });

  test('victory after completing wave 9', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });

    for (let w = 1; w <= MAX_WAVE; w++) {
      const needed = Math.ceil(result.current.totalGreens * GREEN_THRESHOLD);
      tapGreens(result, needed);
      const timerMs = getWaveTimer(w) * 1000;
      act(() => { jest.advanceTimersByTime(timerMs); });

      if (w < MAX_WAVE) {
        expect(result.current.gamePhase).toBe('wave-complete');
        act(() => { result.current.nextWave(); });
      }
    }

    expect(result.current.gamePhase).toBe('victory');
  });

  test('startGame resets everything back to wave 1', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const needed = Math.ceil(result.current.totalGreens * GREEN_THRESHOLD);
    tapGreens(result, needed);
    act(() => { jest.advanceTimersByTime(12000); });
    act(() => { result.current.nextWave(); });
    expect(result.current.wave).toBe(2);

    act(() => { result.current.startGame(); });
    expect(result.current.wave).toBe(1);
    expect(result.current.score).toBe(0);
    expect(result.current.waveScore).toBe(0);
    expect(result.current.greensTapped).toBe(0);
    expect(result.current.grid).toHaveLength(25);
    expect(result.current.gamePhase).toBe('playing');
  });
});

describe('useGame - edge cases', () => {
  test('rapid double-tap on green does not double-count', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
  });

  test('rapid double-tap on red does not double-deduct while monster visible', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    const redCell = result.current.grid.find((c: Cell) => c.type === 'red')!;
    act(() => { result.current.tapCell(redCell.id); });
    act(() => { result.current.tapCell(redCell.id); });
    expect(result.current.score).toBe(POINTS.red);
  });

  test('nextWave is ignored when not in wave-complete phase', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(); });
    act(() => { result.current.nextWave(); });
    expect(result.current.wave).toBe(1);
    expect(result.current.gamePhase).toBe('playing');
  });
});
