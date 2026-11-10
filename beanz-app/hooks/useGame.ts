import { useState, useCallback, useRef, useEffect } from 'react';
import { getWaveConfig, getWaveTimer, MAX_WAVE, MAGIC_INTERVAL, MAGIC_VISIBLE_DURATION, POINTS, GREEN_THRESHOLD } from '../constants/game';

export interface Cell {
  id: string;
  type: 'green' | 'red' | 'magic';
  tapped: boolean;
  originalType?: 'green' | 'red';
}

export type GamePhase = 'idle' | 'playing' | 'wave-complete' | 'game-over' | 'victory';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildGrid(wave: number): Cell[] {
  const config = getWaveConfig(wave);
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
  const [waveScore, setWaveScore] = useState(0);
  const [greensTapped, setGreensTapped] = useState(0);
  const [totalGreens, setTotalGreens] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [wave, setWave] = useState(1);

  const greensTappedRef = useRef(0);
  const totalGreensRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const magicTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const applyMagic = useCallback((currentGrid: Cell[], currentWave: number): Cell[] => {
    const config = getWaveConfig(currentWave);
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

  const initWave = useCallback((w: number) => {
    const newGrid = buildGrid(w);
    const greens = newGrid.filter(c => c.type === 'green').length;
    setGrid(newGrid);
    setTotalGreens(greens);
    totalGreensRef.current = greens;
    setGreensTapped(0);
    greensTappedRef.current = 0;
    setWaveScore(0);
    setTimeLeft(getWaveTimer(w));
    setGamePhase('playing');
  }, []);

  const startGame = useCallback(() => {
    clearTimers();
    setWave(1);
    setScore(0);
    initWave(1);
  }, [clearTimers, initWave]);

  const nextWave = useCallback(() => {
    if (gamePhase !== 'wave-complete') return;
    clearTimers();
    const next = wave + 1;
    setWave(next);
    initWave(next);
  }, [gamePhase, wave, clearTimers, initWave]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimers();
          setGrid(g => removeMagic(g));

          const gt = greensTappedRef.current;
          const tg = totalGreensRef.current;
          const needed = Math.ceil(tg * GREEN_THRESHOLD);

          if (gt >= needed) {
            if (wave >= MAX_WAVE) {
              setGamePhase('victory');
            } else {
              setGamePhase('wave-complete');
            }
          } else {
            setGamePhase('game-over');
          }
          return 0;
        }

        if ((prev - 1) % MAGIC_INTERVAL === 0 && prev - 1 > 0) {
          setGrid(g => applyMagic(g, wave));
          magicTimeoutRef.current = setTimeout(() => {
            setGrid(current => removeMagic(current));
          }, MAGIC_VISIBLE_DURATION);
        }

        return prev - 1;
      });
    }, 1000);

    return () => { clearTimers(); };
  }, [gamePhase, wave, clearTimers, applyMagic, removeMagic]);

  const tapCell = useCallback((id: string) => {
    if (gamePhase !== 'playing') return;

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
          greensTappedRef.current += 1;
          setGreensTapped(g => g + 1);
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
      setWaveScore(ws => ws + pointDelta);
      const newGrid = [...prevGrid];
      newGrid[cellIndex] = updatedCell;
      return shuffle(newGrid);
    });
  }, [gamePhase]);

  return { score, waveScore, greensTapped, totalGreens, timeLeft, gamePhase, grid, wave, startGame, nextWave, tapCell };
}
