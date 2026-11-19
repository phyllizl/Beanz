import { submitScore, fetchLeaderboard } from '../scores';
import type { ScoreEntry } from '../scores';

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

jest.mock('../../constants/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => ({
      insert: (data: any) => {
        mockInsert(data);
        return {
          select: (cols: string) => {
            mockSelect(cols);
            return { single: mockSingle };
          },
        };
      },
      select: (cols: string) => {
        mockSelect(cols);
        return {
          order: (col: string, opts: any) => {
            mockOrder(col, opts);
            return { limit: mockLimit };
          },
        };
      },
    })),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('submitScore', () => {
  test('returns score ID on success', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'abc-123' },
      error: null,
    });
    const id = await submitScore('ZAP', 100, 5);
    expect(id).toBe('abc-123');
    expect(mockInsert).toHaveBeenCalledWith({ name: 'ZAP', score: 100, wave: 5 });
  });

  test('returns null on error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });
    const id = await submitScore('ZAP', 100, 5);
    expect(id).toBeNull();
  });
});

describe('fetchLeaderboard', () => {
  test('returns score entries on success', async () => {
    const mockScores: ScoreEntry[] = [
      { id: '1', name: 'ZAP', score: 200, wave: 7, created_at: '2026-01-01T00:00:00Z' },
      { id: '2', name: 'BEE', score: 150, wave: 5, created_at: '2026-01-01T00:00:00Z' },
    ];
    mockLimit.mockResolvedValue({ data: mockScores, error: null });
    const result = await fetchLeaderboard();
    expect(result).toEqual(mockScores);
    expect(mockOrder).toHaveBeenCalledWith('score', { ascending: false });
  });

  test('returns empty array on error', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: 'fetch failed' } });
    const result = await fetchLeaderboard();
    expect(result).toEqual([]);
  });
});
