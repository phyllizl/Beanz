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

  const applyMagic = useCallback((currentGrid: Cell[], currentLevel: Level): Cell[] => {
    const config = LEVELS[currentLevel];
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
          setGrid(g => applyMagic(g, level));
          magicTimeoutRef.current = setTimeout(() => {
            setGrid(current => removeMagic(current));
          }, MAGIC_VISIBLE_DURATION);
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

      if (cell.tapped) return prevGrid;

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
