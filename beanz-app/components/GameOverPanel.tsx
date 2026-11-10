import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface GameOverPanelProps {
  score: number;
  onPlayAgain: () => void;
  onLevel2: () => void;
}

export function GameOverPanel({ score, onPlayAgain, onLevel2 }: GameOverPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.doneText}>DONE!</Text>
      <Text style={styles.scoreText}>YOUR SCORE: {score}</Text>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={onPlayAgain}>
          <Text style={styles.buttonText}>PLAY AGAIN</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onLevel2}>
          <Text style={styles.buttonText}>LEVEL 2</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  doneText: {
    color: '#FFFF00',
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
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
