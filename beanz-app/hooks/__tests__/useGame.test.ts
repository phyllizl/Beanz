import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useGame } from '../useGame';
import { POINTS } from '../../constants/game';
import type { Cell } from '../useGame';

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
    const greenCount = result.current.grid.filter((c: Cell) => c.type === 'green').length;
    expect(greenCount).toBe(Math.floor((36 / 100) * 35));
  });

  test('level 2 grid has ~30% green beans', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(2); });
    const greenCount = result.current.grid.filter((c: Cell) => c.type === 'green').length;
    expect(greenCount).toBe(Math.floor((81 / 100) * 30));
  });

  test('remaining cells are red', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCount = result.current.grid.filter((c: Cell) => c.type === 'green').length;
    const redCount = result.current.grid.filter((c: Cell) => c.type === 'red').length;
    expect(greenCount + redCount).toBe(36);
  });

  test('all cells start untapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    expect(result.current.grid.every((c: Cell) => !c.tapped)).toBe(true);
  });

  test('each cell has a unique id', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const ids = result.current.grid.map((c: Cell) => c.id);
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
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
  });

  test('tapping red bean subtracts 3 points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const redCell = result.current.grid.find((c: Cell) => c.type === 'red')!;
    act(() => { result.current.tapCell(redCell.id); });
    expect(result.current.score).toBe(POINTS.red);
  });

  test('tapping green bean marks it as tapped', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    const tappedCell = result.current.grid.find((c: Cell) => c.id === greenCell.id)!;
    expect(tappedCell.tapped).toBe(true);
  });

  test('tapping already-tapped green bean does not add points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
  });

  test('grid is shuffled after each tap', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const orderBefore = result.current.grid.map((c: Cell) => c.id);
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    const orderAfter = result.current.grid.map((c: Cell) => c.id);
    expect(orderAfter).not.toEqual(orderBefore);
  });
});

describe('useGame - timer', () => {
  test('timer starts at 12 after startGame', () => {
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
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(2000); });
    const magicCount = result.current.grid.filter((c: Cell) => c.type === 'magic').length;
    expect(magicCount).toBeGreaterThan(0);
  });

  test('magic beans disappear after 2 seconds', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(2000); });
    const hadMagic = result.current.grid.some((c: Cell) => c.type === 'magic');
    expect(hadMagic).toBe(true);
    act(() => { jest.advanceTimersByTime(2000); });
    const hasMagic = result.current.grid.some((c: Cell) => c.type === 'magic');
    expect(hasMagic).toBe(false);
  });

  test('tapping magic bean adds 8 points', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(2000); });
    const magicCell = result.current.grid.find((c: Cell) => c.type === 'magic');
    if (magicCell) {
      act(() => { result.current.tapCell(magicCell.id); });
      expect(result.current.score).toBe(POINTS.magic);
    }
  });
});

describe('useGame - edge cases', () => {
  test('rapid double-tap on green does not double-count', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const greenCell = result.current.grid.find((c: Cell) => c.type === 'green')!;
    act(() => { result.current.tapCell(greenCell.id); });
    act(() => { result.current.tapCell(greenCell.id); });
    expect(result.current.score).toBe(POINTS.green);
  });

  test('rapid double-tap on red does not double-deduct while monster visible', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    const redCell = result.current.grid.find((c: Cell) => c.type === 'red')!;
    act(() => { result.current.tapCell(redCell.id); });
    act(() => { result.current.tapCell(redCell.id); });
    expect(result.current.score).toBe(POINTS.red);
  });

  test('game over during magic cycle disables all taps', () => {
    const { result } = renderHook(() => useGame());
    act(() => { result.current.startGame(1); });
    act(() => { jest.advanceTimersByTime(7000); });
    act(() => { jest.advanceTimersByTime(5000); });
    expect(result.current.isGameOver).toBe(true);
    const anyCell = result.current.grid[0];
    const scoreBefore = result.current.score;
    act(() => { result.current.tapCell(anyCell.id); });
    expect(result.current.score).toBe(scoreBefore);
  });
});
