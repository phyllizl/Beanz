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
