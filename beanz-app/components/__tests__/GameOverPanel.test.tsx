import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { GameOverPanel } from '../GameOverPanel';

const { act } = ReactTestRenderer;

describe('GameOverPanel', () => {
  const onPlayAgain = jest.fn();
  const onLevel2 = jest.fn();

  beforeEach(() => {
    onPlayAgain.mockClear();
    onLevel2.mockClear();
  });

  test('displays final score', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={42} onPlayAgain={onPlayAgain} onLevel2={onLevel2} />
      );
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('42');
  });

  test('PLAY AGAIN button calls onPlayAgain', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} onPlayAgain={onPlayAgain} onLevel2={onLevel2} />
      );
    });
    const playAgainBtn = root!.root.findAll(node => {
      try { return node.children?.includes('PLAY AGAIN'); } catch { return false; }
    })[0];
    // Walk up to Pressable parent
    let pressable = playAgainBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(onPlayAgain).toHaveBeenCalled();
  });

  test('LEVEL 2 button calls onLevel2', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} onPlayAgain={onPlayAgain} onLevel2={onLevel2} />
      );
    });
    const level2Btn = root!.root.findAll(node => {
      try { return node.children?.includes('LEVEL 2'); } catch { return false; }
    })[0];
    let pressable = level2Btn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(onLevel2).toHaveBeenCalled();
  });
});
