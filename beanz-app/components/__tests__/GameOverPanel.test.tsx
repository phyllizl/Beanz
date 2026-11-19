import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { GameOverPanel } from '../GameOverPanel';

const { act } = ReactTestRenderer;

describe('GameOverPanel', () => {
  const onPlayAgain = jest.fn();
  const onSubmit = jest.fn();

  beforeEach(() => {
    onPlayAgain.mockClear();
    onSubmit.mockClear();
    onSubmit.mockResolvedValue('abc-123');
  });

  test('displays final score, wave, and player name', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={42} wave={5} playerName="ZAP" onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
      );
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('42');
    expect(json).toContain('5');
    expect(json).toContain('ZAP');
  });

  test('PLAY AGAIN button calls onPlayAgain', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} playerName="AAA" onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
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

  test('SUBMIT button calls onSubmit', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} playerName="AAA" onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
      );
    });
    const submitBtn = root!.root.findAll(node => {
      try { return node.children?.includes('SUBMIT'); } catch { return false; }
    })[0];
    let pressable = submitBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    await act(async () => { pressable.props.onPress(); });
    expect(onSubmit).toHaveBeenCalled();
  });

  test('SUBMIT button is disabled while submitting', async () => {
    let resolveSubmit: (value: string | null) => void;
    const slowSubmit = jest.fn(() => new Promise<string | null>(r => { resolveSubmit = r; }));
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} playerName="AAA" onPlayAgain={onPlayAgain} onSubmit={slowSubmit} />
      );
    });
    const submitBtn = root!.root.findAll(node => {
      try { return node.children?.includes('SUBMIT'); } catch { return false; }
    })[0];
    let pressable = submitBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }

    let submitPromise: Promise<void>;
    act(() => { submitPromise = pressable.props.onPress(); });

    act(() => { pressable.props.onPress(); });
    expect(slowSubmit).toHaveBeenCalledTimes(1);

    await act(async () => { resolveSubmit!('abc-123'); await submitPromise!; });
  });

  test('shows error message when submission fails', async () => {
    onSubmit.mockResolvedValue(null);
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} playerName="AAA" onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
      );
    });
    const submitBtn = root!.root.findAll(node => {
      try { return node.children?.includes('SUBMIT'); } catch { return false; }
    })[0];
    let pressable = submitBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    await act(async () => { pressable.props.onPress(); });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('Could not submit score');
  });
});
