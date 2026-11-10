import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SplashScreen from '../index';

const { act } = ReactTestRenderer;

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('SplashScreen', () => {
  beforeEach(() => { mockPush.mockClear(); });

  test('renders title', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<SplashScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('ARE YOU READY FOR BEANZ');
  });

  test('PLAY NOW navigates to instructions', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<SplashScreen />);
    });
    const playBtn = root!.root.findAll(node => {
      try { return node.children?.includes('PLAY NOW'); } catch { return false; }
    })[0];
    let pressable = playBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(mockPush).toHaveBeenCalledWith('/instructions');
  });

  test('LEADERBOARD navigates to leaderboard', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<SplashScreen />);
    });
    const lbBtn = root!.root.findAll(node => {
      try { return node.children?.includes('LEADERBOARD'); } catch { return false; }
    })[0];
    let pressable = lbBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(mockPush).toHaveBeenCalledWith('/leaderboard');
  });
});
