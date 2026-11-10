import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import GameScreen from '../game';

const { act } = ReactTestRenderer;

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('expo-image', () => ({
  Image: 'ExpoImage',
}));

jest.mock('../../lib/scores', () => ({
  submitScore: jest.fn(),
}));

describe('GameScreen', () => {
  beforeEach(() => { mockPush.mockClear(); });

  test('renders BEANZ title', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<GameScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('BEANZ');
  });

  test('renders START button initially', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<GameScreen />);
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('START');
  });
});
