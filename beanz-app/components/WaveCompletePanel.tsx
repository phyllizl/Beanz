import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface WaveCompletePanelProps {
  wave: number;
  waveScore: number;
  totalScore: number;
  onNextWave: () => void;
}

export function WaveCompletePanel({ wave, waveScore, totalScore, onNextWave }: WaveCompletePanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.completeText}>{`WAVE ${wave} COMPLETE!`}</Text>
      <Text style={styles.scoreText}>WAVE SCORE: {waveScore}</Text>
      <Text style={styles.totalText}>TOTAL: {totalScore}</Text>
      <Pressable style={styles.button} onPress={onNextWave}>
        <Text style={styles.buttonText}>NEXT WAVE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  completeText: {
    color: '#00FF00',
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  totalText: {
    color: '#FFFF00',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
