import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchLeaderboard } from '../lib/scores';
import type { ScoreEntry } from '../lib/scores';

type LoadState = 'loading' | 'loaded' | 'error';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { scoreId } = useLocalSearchParams<{ scoreId?: string }>();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const data = await fetchLeaderboard();
      setScores(data);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loadState === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>LEADERBOARD</Text>
        <Text style={styles.message}>LOADING...</Text>
      </View>
    );
  }

  if (loadState === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>LEADERBOARD</Text>
        <Text style={styles.message}>COULD NOT LOAD SCORES</Text>
        <Pressable style={styles.button} onPress={load}>
          <Text style={styles.buttonText}>RETRY</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LEADERBOARD</Text>

      {scores.length === 0 ? (
        <Text style={styles.message}>NO SCORES YET</Text>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.rankCol]}>#</Text>
            <Text style={[styles.headerCell, styles.nameCol]}>NAME</Text>
            <Text style={[styles.headerCell, styles.scoreCol]}>SCORE</Text>
            <Text style={[styles.headerCell, styles.waveCol]}>WAVE</Text>
          </View>
          <FlatList
            style={{ flex: 1 }}
            data={scores}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              const isHighlighted = item.id === scoreId;
              return (
                <View style={[styles.row, isHighlighted && styles.highlightedRow]}>
                  <Text style={[styles.cell, styles.rankCol]}>{index + 1}</Text>
                  <Text style={[styles.cell, styles.nameCol]}>{item.name}</Text>
                  <Text style={[styles.cell, styles.scoreCol]}>{item.score}</Text>
                  <Text style={[styles.cell, styles.waveCol]}>{item.wave}</Text>
                </View>
              );
            }}
          />
        </>
      )}

      <Pressable style={styles.button} onPress={() => router.push('/game')}>
        <Text style={styles.buttonText}>PLAY AGAIN</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: {
    color: '#FFFF00',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFF00',
  },
  headerCell: {
    color: '#FFFF00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  highlightedRow: {
    backgroundColor: '#333300',
  },
  cell: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  rankCol: { width: 40 },
  nameCol: { width: 80 },
  scoreCol: { flex: 1 },
  waveCol: { width: 60, textAlign: 'right' },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 24,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
