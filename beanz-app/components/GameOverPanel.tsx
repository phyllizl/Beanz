import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface GameOverPanelProps {
  score: number;
  wave: number;
  onPlayAgain: () => void;
}

export function GameOverPanel({ score, wave, onPlayAgain }: GameOverPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.doneText}>GAME OVER</Text>
      <Text style={styles.waveText}>{`WAVE ${wave}`}</Text>
      <Text style={styles.scoreText}>YOUR SCORE: {score}</Text>
      <Pressable style={styles.button} onPress={onPlayAgain}>
        <Text style={styles.buttonText}>PLAY AGAIN</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  doneText: {
    color: '#FF4444',
    fontSize: 36,
    fontWeight: 'bold',
  },
  waveText: {
    color: '#FFFF00',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  scoreText: {
    color: '#FFFFFF',
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
