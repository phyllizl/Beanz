import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import LeaderboardScreen from '../leaderboard';

const { act } = ReactTestRenderer;

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useLocalSearchParams: () => mockParams,
}));

const mockFetchLeaderboard = jest.fn();
jest.mock('../../lib/scores', () => ({
  fetchLeaderboard: (...args: any[]) => mockFetchLeaderboard(...args),
}));

beforeEach(() => {
  mockPush.mockClear();
  mockFetchLeaderboard.mockClear();
  mockParams = {};
});

describe('LeaderboardScreen', () => {
  test('shows LOADING... while fetching', () => {
    mockFetchLeaderboard.mockReturnValue(new Promise(() => {}));
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<LeaderboardScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('LOADING');
  });

  test('shows NO SCORES YET when list is empty', async () => {
    mockFetchLeaderboard.mockResolvedValue([]);
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<LeaderboardScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('NO SCORES YET');
  });

  test('displays scores in ranked order', async () => {
    mockFetchLeaderboard.mockResolvedValue([
      { id: '1', name: 'ZAP', score: 200, wave: 7, created_at: '2026-01-01T00:00:00Z' },
      { id: '2', name: 'BEE', score: 150, wave: 5, created_at: '2026-01-01T00:00:00Z' },
    ]);
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<LeaderboardScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('ZAP');
    expect(json).toContain('200');
    expect(json).toContain('BEE');
    expect(json).toContain('150');
  });

  test('PLAY AGAIN navigates to /game', async () => {
    mockFetchLeaderboard.mockResolvedValue([]);
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<LeaderboardScreen />);
    });
    const playBtn = root!.root.findAll(node => {
      try { return node.children?.includes('PLAY AGAIN'); } catch { return false; }
    })[0];
    let pressable = playBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(mockPush).toHaveBeenCalledWith('/game');
  });

  test('shows error state with RETRY on fetch failure', async () => {
    mockFetchLeaderboard.mockRejectedValueOnce(new Error('network'));
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<LeaderboardScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('COULD NOT LOAD SCORES');
    expect(json).toContain('RETRY');
  });

  test('RETRY re-fetches the leaderboard', async () => {
    mockFetchLeaderboard.mockRejectedValueOnce(new Error('network'));
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<LeaderboardScreen />);
    });
    mockFetchLeaderboard.mockResolvedValue([
      { id: '1', name: 'ZAP', score: 200, wave: 7, created_at: '2026-01-01T00:00:00Z' },
    ]);
    const retryBtn = root!.root.findAll(node => {
      try { return node.children?.includes('RETRY'); } catch { return false; }
    })[0];
    let pressable = retryBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    await act(async () => { pressable.props.onPress(); });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('ZAP');
  });
});
