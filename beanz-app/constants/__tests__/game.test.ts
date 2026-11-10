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
