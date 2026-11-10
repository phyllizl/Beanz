import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { WaveCompletePanel } from '../WaveCompletePanel';

const { act } = ReactTestRenderer;

describe('WaveCompletePanel', () => {
  const onNextWave = jest.fn();

  beforeEach(() => {
    onNextWave.mockClear();
  });

  test('displays wave number and scores', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <WaveCompletePanel wave={3} waveScore={15} totalScore={42} onNextWave={onNextWave} />
      );
    });
    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('WAVE 3');
    expect(json).toContain('15');
    expect(json).toContain('42');
  });

  test('NEXT WAVE button calls onNextWave', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <WaveCompletePanel wave={2} waveScore={10} totalScore={20} onNextWave={onNextWave} />
      );
    });
    const nextBtn = root!.root.findAll(node => {
      try { return node.children?.includes('NEXT WAVE'); } catch { return false; }
    })[0];
    let pressable = nextBtn;
    while (pressable && typeof pressable.props.onPress !== 'function') {
      pressable = pressable.parent as any;
    }
    act(() => { pressable.props.onPress(); });
    expect(onNextWave).toHaveBeenCalled();
  });
});
