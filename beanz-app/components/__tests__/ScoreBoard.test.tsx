import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ScoreBoard } from '../ScoreBoard';

const { act } = ReactTestRenderer;

describe('ScoreBoard', () => {
  test('shows START button when not running', () => {
    const onStart = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <ScoreBoard timeLeft={12} score={0} wave={1} isRunning={false} onStart={onStart} />
      );
    });
    const button = root!.root.findAll(node => {
      try { return node.children?.includes('START'); } catch { return false; }
    });
    expect(button.length).toBeGreaterThan(0);
  });

  test('hides START button when running', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <ScoreBoard timeLeft={10} score={5} wave={1} isRunning={true} onStart={jest.fn()} />
      );
    });
    const buttons = root!.root.findAll(node => {
      try { return node.children?.includes('START'); } catch { return false; }
    });
    expect(buttons.length).toBe(0);
  });

  test('displays timer, score, and wave when running', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <ScoreBoard timeLeft={8} score={15} wave={3} isRunning={true} onStart={jest.fn()} />
      );
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('8');
    expect(json).toContain('15');
    expect(json).toContain('WAVE 3');
  });
});
