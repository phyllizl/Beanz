import { getWaveConfig, getWaveTimer, MAX_GRID, MIN_GREEN_PERCENT, BASE_TIMER, MIN_TIMER, GREEN_THRESHOLD, MAGIC_INTERVAL, MAGIC_VISIBLE_DURATION, POINTS } from '../game';

describe('game constants', () => {
  test('base timer is 12 seconds', () => {
    expect(BASE_TIMER).toBe(12);
  });

  test('minimum timer is 8 seconds', () => {
    expect(MIN_TIMER).toBe(8);
  });

  test('green threshold is 100%', () => {
    expect(GREEN_THRESHOLD).toBe(1.0);
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
  test('wave 1 has 5x5 grid, 40% green, 1 magic', () => {
    const config = getWaveConfig(1);
    expect(config.gridSize).toBe(5);
    expect(config.greenPercent).toBe(40);
    expect(config.magicCount).toBe(1);
  });

  test('wave 5 has 9x9 grid, 32% green, 3 magic', () => {
    const config = getWaveConfig(5);
    expect(config.gridSize).toBe(9);
    expect(config.greenPercent).toBe(32);
    expect(config.magicCount).toBe(3);
  });

  test('wave 9 has 13x13 grid, 24% green, 5 magic', () => {
    const config = getWaveConfig(9);
    expect(config.gridSize).toBe(13);
    expect(config.greenPercent).toBe(24);
    expect(config.magicCount).toBe(5);
  });

  test('grid size caps at MAX_GRID', () => {
    expect(getWaveConfig(1).gridSize).toBe(5);
    expect(getWaveConfig(9).gridSize).toBe(MAX_GRID);
    expect(getWaveConfig(20).gridSize).toBe(MAX_GRID);
  });

  test('green percent floors at MIN_GREEN_PERCENT', () => {
    expect(getWaveConfig(1).greenPercent).toBe(40);
    expect(getWaveConfig(9).greenPercent).toBe(MIN_GREEN_PERCENT);
    expect(getWaveConfig(20).greenPercent).toBe(MIN_GREEN_PERCENT);
  });

  test('magic count formula is ceil(wave / 2)', () => {
    for (let w = 1; w <= 9; w++) {
      expect(getWaveConfig(w).magicCount).toBe(Math.ceil(w / 2));
    }
  });
});

describe('getWaveTimer', () => {
  test('wave 1 timer is 12 seconds', () => {
    expect(getWaveTimer(1)).toBe(12);
  });

  test('wave 5 timer is 10 seconds', () => {
    expect(getWaveTimer(5)).toBe(10);
  });

  test('timer floors at 8 seconds', () => {
    expect(getWaveTimer(9)).toBe(8);
    expect(getWaveTimer(10)).toBe(8);
  });

  test('timer decreases by 1 every 2 waves', () => {
    expect(getWaveTimer(1)).toBe(12);
    expect(getWaveTimer(2)).toBe(12);
    expect(getWaveTimer(3)).toBe(11);
    expect(getWaveTimer(4)).toBe(11);
    expect(getWaveTimer(5)).toBe(10);
    expect(getWaveTimer(6)).toBe(10);
    expect(getWaveTimer(7)).toBe(9);
    expect(getWaveTimer(8)).toBe(9);
    expect(getWaveTimer(9)).toBe(8);
  });
});
