import { getWaveConfig, MAX_WAVE, TIMER_DURATION, MAGIC_INTERVAL, MAGIC_VISIBLE_DURATION, POINTS } from '../game';

describe('game constants', () => {
  test('MAX_WAVE is 9', () => {
    expect(MAX_WAVE).toBe(9);
  });

  test('timer duration is 12 seconds', () => {
    expect(TIMER_DURATION).toBe(12);
  });

  test('magic interval is 5 seconds', () => {
    expect(MAGIC_INTERVAL).toBe(5);
  });

  test('magic visible duration is 2000ms', () => {
    expect(MAGIC_VISIBLE_DURATION).toBe(2000);
  });

  test('points are correct', () => {
    expect(POINTS.green).toBe(5);
    expect(POINTS.red).toBe(-3);
    expect(POINTS.magic).toBe(8);
  });
});

describe('getWaveConfig', () => {
  test('wave 1 has 4x4 grid, 40% green, 1 magic', () => {
    const config = getWaveConfig(1);
    expect(config.gridSize).toBe(4);
    expect(config.greenPercent).toBe(40);
    expect(config.magicCount).toBe(1);
  });

  test('wave 5 has 8x8 grid, 32% green, 3 magic', () => {
    const config = getWaveConfig(5);
    expect(config.gridSize).toBe(8);
    expect(config.greenPercent).toBe(32);
    expect(config.magicCount).toBe(3);
  });

  test('wave 9 has 12x12 grid, 24% green, 5 magic', () => {
    const config = getWaveConfig(9);
    expect(config.gridSize).toBe(12);
    expect(config.greenPercent).toBe(24);
    expect(config.magicCount).toBe(5);
  });

  test('grid size formula is wave + 3', () => {
    for (let w = 1; w <= MAX_WAVE; w++) {
      expect(getWaveConfig(w).gridSize).toBe(w + 3);
    }
  });

  test('green percent formula is 42 - wave * 2', () => {
    for (let w = 1; w <= MAX_WAVE; w++) {
      expect(getWaveConfig(w).greenPercent).toBe(42 - w * 2);
    }
  });

  test('magic count formula is ceil(wave / 2)', () => {
    for (let w = 1; w <= MAX_WAVE; w++) {
      expect(getWaveConfig(w).magicCount).toBe(Math.ceil(w / 2));
    }
  });
});
