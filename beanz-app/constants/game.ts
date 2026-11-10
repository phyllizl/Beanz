export interface WaveConfig {
  gridSize: number;
  greenPercent: number;
  magicCount: number;
}

export const MAX_WAVE = 9;

export function getWaveConfig(wave: number): WaveConfig {
  return {
    gridSize: wave + 3,
    greenPercent: 42 - wave * 2,
    magicCount: Math.ceil(wave / 2),
  };
}

export const TIMER_DURATION = 12;
export const MAGIC_INTERVAL = 5;
export const MAGIC_VISIBLE_DURATION = 2000;
export const POINTS = { green: 5, red: -3, magic: 8 } as const;
