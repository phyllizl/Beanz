import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import InstructionsScreen from '../instructions';

const { act } = ReactTestRenderer;

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('expo-image', () => ({
  Image: 'ExpoImage',
}));

describe('InstructionsScreen', () => {
  beforeEach(() => { mockPush.mockClear(); });

  test('renders instructions heading', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<InstructionsScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('INSTRUCTIONS');
  });

  test('mentions green beans, red beans, and magic beans', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<InstructionsScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('Green Bean');
    expect(json).toContain('Red Bean');
    expect(json).toContain('Magic Bean');
  });

  test('PLAY NOW navigates to game', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<InstructionsScreen />);
    });
    const playBtn = root!.root.findAll(node => {
      try { return node.children?.includes('PLAY NOW'); } catch { return false; }
    })[0];
    let pressable = playBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(mockPush).toHaveBeenCalledWith('/game');
  });
});
