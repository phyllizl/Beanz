import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { GameOverPanel } from '../GameOverPanel';

const { act } = ReactTestRenderer;

describe('GameOverPanel', () => {
  const onPlayAgain = jest.fn();

  beforeEach(() => {
    onPlayAgain.mockClear();
  });

  test('displays final score and wave reached', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={42} wave={5} onPlayAgain={onPlayAgain} />
      );
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('42');
    expect(json).toContain('5');
  });

  test('PLAY AGAIN button calls onPlayAgain', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} />
      );
    });
    const playAgainBtn = root!.root.findAll(node => {
      try { return node.children?.includes('PLAY AGAIN'); } catch { return false; }
    })[0];
    let pressable = playAgainBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(onPlayAgain).toHaveBeenCalled();
  });
});
