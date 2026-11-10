import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ScoreBoardProps {
  timeLeft: number;
  score: number;
  wave: number;
  isRunning: boolean;
  onStart: () => void;
}

export function ScoreBoard({ timeLeft, score, wave, isRunning, onStart }: ScoreBoardProps) {
  return (
    <View style={styles.container}>
      {isRunning ? (
        <>
          <Text style={styles.wave}>{`WAVE ${wave}`}</Text>
          <Text style={styles.timer}>{timeLeft}</Text>
          <Text style={styles.score}>YOUR SCORE: {score}</Text>
        </>
      ) : (
        <Pressable style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>START</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  wave: {
    color: '#FFFF00',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  score: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
