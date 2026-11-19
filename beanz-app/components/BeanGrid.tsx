import React, { memo } from 'react';
import { FlatList, useWindowDimensions, StyleSheet, View } from 'react-native';
import { BeanCell } from './BeanCell';
import type { Cell } from '../hooks/useGame';

interface BeanGridProps {
  grid: Cell[];
  gridSize: number;
  onTap: (id: string) => void;
  disabled: boolean;
}

export const BeanGrid = memo(function BeanGrid({ grid, gridSize, onTap, disabled }: BeanGridProps) {
  const { width } = useWindowDimensions();
  const gridWidth = Math.min(width - 32, 500);
  const cellSize = gridWidth / gridSize;

  return (
    <View style={[styles.container, { width: gridWidth }]}>
      <FlatList
        key={gridSize}
        data={grid}
        numColumns={gridSize}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <BeanCell cell={item} size={cellSize} onTap={onTap} disabled={disabled} />
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
