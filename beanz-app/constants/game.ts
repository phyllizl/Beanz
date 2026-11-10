export interface WaveConfig {
  gridSize: number;
  greenPercent: number;
  magicCount: number;
}

export const MAX_WAVE = 9;
export const BASE_TIMER = 12;
export const MIN_TIMER = 8;
export const GREEN_THRESHOLD = 1.0;

export function getWaveConfig(wave: number): WaveConfig {
  return {
    gridSize: wave + 4,
    greenPercent: 42 - wave * 2,
    magicCount: Math.ceil(wave / 2),
  };
}

export function getWaveTimer(wave: number): number {
  return Math.max(MIN_TIMER, BASE_TIMER - Math.floor((wave - 1) / 2));
}

export const MAGIC_INTERVAL = 5;
export const MAGIC_VISIBLE_DURATION = 2000;
export const POINTS = { green: 5, red: -3, magic: 8 } as const;
