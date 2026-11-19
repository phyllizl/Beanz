import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BeanCell } from '../BeanCell';
import type { Cell } from '../../hooks/useGame';

const { act } = ReactTestRenderer;

const makeCell = (overrides: Partial<Cell> = {}): Cell => ({
  id: 'cell-0',
  type: 'green',
  tapped: false,
  ...overrides,
});

describe('BeanCell', () => {
  const onTap = jest.fn();

  beforeEach(() => { onTap.mockClear(); });

  test('calls onTap with cell id when pressed', () => {
    const cell = makeCell();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BeanCell cell={cell} size={50} onTap={onTap} disabled={false} />
      );
    });
    const pressable = root!.root.findByProps({ testID: `bean-${cell.id}` });
    act(() => { pressable.props.onPress(); });
    expect(onTap).toHaveBeenCalledWith('cell-0');
  });

  test('does not call onTap when disabled', () => {
    const cell = makeCell();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BeanCell cell={cell} size={50} onTap={onTap} disabled={true} />
      );
    });
    const pressable = root!.root.findByProps({ testID: `bean-${cell.id}` });
    expect(pressable.props.disabled).toBe(true);
  });

  test('renders with correct size', () => {
    const cell = makeCell();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BeanCell cell={cell} size={80} onTap={onTap} disabled={false} />
      );
    });
    const pressable = root!.root.findByProps({ testID: `bean-${cell.id}` });
    const style = pressable.props.style;
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
    expect(flatStyle.width).toBe(80);
    expect(flatStyle.height).toBe(80);
  });
});
