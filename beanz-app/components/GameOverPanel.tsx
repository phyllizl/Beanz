import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

interface GameOverPanelProps {
  score: number;
  wave: number;
  onPlayAgain: () => void;
  onSubmit: (name: string) => Promise<string | null>;
}

export function GameOverPanel({ score, wave, onPlayAgain, onSubmit }: GameOverPanelProps) {
  const [name, setName] = useState('AAA');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (text: string) => {
    const filtered = text.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    setName(filtered);
  };

  const handleSubmit = async () => {
    if (submitting || name.length !== 3) return;
    setSubmitting(true);
    setError('');
    const id = await onSubmit(name);
    if (!id) {
      setError('Could not submit score');
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.doneText}>GAME OVER</Text>
      <Text style={styles.waveText}>{`WAVE ${wave}`}</Text>
      <Text style={styles.scoreText}>{`YOUR SCORE: ${score}`}</Text>

      <TextInput
        testID="name-input"
        style={styles.nameInput}
        value={name}
        onChangeText={handleNameChange}
        maxLength={3}
        autoCapitalize="characters"
        placeholder="AAA"
        placeholderTextColor="#666666"
      />

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>{submitting ? 'SUBMITTING...' : 'SUBMIT'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onPlayAgain}>
          <Text style={styles.buttonText}>PLAY AGAIN</Text>
        </Pressable>
      </View>

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}
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
  nameInput: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFFF00',
    width: 120,
    paddingVertical: 8,
    marginBottom: 16,
    letterSpacing: 12,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 12,
  },
});
