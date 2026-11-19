import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BeanGrid } from '../BeanGrid';
import type { Cell } from '../../hooks/useGame';

const { act } = ReactTestRenderer;

function makeCells(count: number): Cell[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `cell-${i}`,
    type: (i % 2 === 0 ? 'green' : 'red') as 'green' | 'red',
    tapped: false,
  }));
}

describe('BeanGrid', () => {
  const onTap = jest.fn();

  beforeEach(() => { onTap.mockClear(); });

  test('renders correct number of cells', () => {
    const cells = makeCells(4);
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BeanGrid grid={cells} gridSize={2} onTap={onTap} disabled={false} />
      );
    });
    const beanCells = root!.root.findAll(
      node => typeof node.props.testID === 'string'
        && node.props.testID.startsWith('bean-cell-')
        && typeof node.props.onPress === 'function',
      { deep: true }
    );
    const uniqueIds = new Set(beanCells.map(n => n.props.testID));
    expect(uniqueIds.size).toBe(4);
  });

  test('passes onTap through to cells', () => {
    const cells = makeCells(4);
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BeanGrid grid={cells} gridSize={2} onTap={onTap} disabled={false} />
      );
    });
    const firstCell = root!.root.findAll(
      node => node.props.testID === 'bean-cell-0'
    )[0];
    act(() => { firstCell.props.onPress(); });
    expect(onTap).toHaveBeenCalledWith('cell-0');
  });
});
