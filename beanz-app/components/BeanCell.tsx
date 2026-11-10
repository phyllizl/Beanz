import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { Cell } from '../hooks/useGame';

const BEAN_IMAGES = {
  green: require('../assets/greenbean.gif'),
  greenTapped: require('../assets/greenSoil.png'),
  red: require('../assets/3dgifmaker89063.gif'),
  redTapped: require('../assets/monster.gif'),
  magic: require('../assets/magicBeans.gif'),
  magicTapped: require('../assets/newstar.png'),
} as const;

function getImage(cell: Cell) {
  if (cell.tapped) {
    switch (cell.type) {
      case 'green': return BEAN_IMAGES.greenTapped;
      case 'red': return BEAN_IMAGES.redTapped;
      case 'magic': return BEAN_IMAGES.magicTapped;
    }
  }
  return BEAN_IMAGES[cell.type];
}

interface BeanCellProps {
  cell: Cell;
  size: number;
  onTap: (id: string) => void;
  disabled: boolean;
}

export const BeanCell = memo(function BeanCell({ cell, size, onTap, disabled }: BeanCellProps) {
  return (
    <Pressable
      testID={`bean-${cell.id}`}
      onPress={() => onTap(cell.id)}
      disabled={disabled}
      style={[styles.cell, { width: size, height: size }]}
    >
      <Image
        source={getImage(cell)}
        style={styles.image}
        contentFit="cover"
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
