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

  test('displays final score and wave reached', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={42} wave={5} onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
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
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
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

  test('renders name input with default AAA', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
      );
    });
    const input = root!.root.findAll(node => node.props.testID === 'name-input')[0];
    expect(input).toBeTruthy();
    expect(input.props.value).toBe('AAA');
  });

  test('name input uppercases and limits to 3 alpha characters', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
      );
    });
    const input = root!.root.findAll(node => node.props.testID === 'name-input')[0];
    act(() => { input.props.onChangeText('ab1c!d'); });
    const inputAfter = root!.root.findAll(node => node.props.testID === 'name-input')[0];
    expect(inputAfter.props.value).toBe('ABC');
  });

  test('SUBMIT button calls onSubmit with the name', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
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
    expect(onSubmit).toHaveBeenCalledWith('AAA');
  });

  test('SUBMIT button is disabled while submitting', async () => {
    let resolveSubmit: (value: string | null) => void;
    const slowSubmit = jest.fn(() => new Promise<string | null>(r => { resolveSubmit = r; }));
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} onSubmit={slowSubmit} />
      );
    });
    const submitBtn = root!.root.findAll(node => {
      try { return node.children?.includes('SUBMIT'); } catch { return false; }
    })[0];
    let pressable = submitBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }

    // Start submission (don't await)
    let submitPromise: Promise<void>;
    act(() => { submitPromise = pressable.props.onPress(); });

    // Try to submit again while in flight
    act(() => { pressable.props.onPress(); });
    expect(slowSubmit).toHaveBeenCalledTimes(1);

    // Resolve to clean up
    await act(async () => { resolveSubmit!('abc-123'); await submitPromise!; });
  });

  test('shows error message when submission fails', async () => {
    onSubmit.mockResolvedValue(null);
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
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

  test('SUBMIT requires exactly 3 characters', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <GameOverPanel score={10} wave={3} onPlayAgain={onPlayAgain} onSubmit={onSubmit} />
      );
    });
    const input = root!.root.findAll(node => node.props.testID === 'name-input')[0];
    act(() => { input.props.onChangeText('AB'); });

    const submitBtn = root!.root.findAll(node => {
      try { return node.children?.includes('SUBMIT'); } catch { return false; }
    })[0];
    let pressable = submitBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    await act(async () => { pressable.props.onPress(); });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
