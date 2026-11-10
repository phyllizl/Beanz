import { View, Text, StyleSheet } from 'react-native';
import { useGame } from '../hooks/useGame';
import { BeanGrid } from '../components/BeanGrid';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameOverPanel } from '../components/GameOverPanel';
import { LEVELS } from '../constants/game';

export default function GameScreen() {
  const { score, timeLeft, isRunning, grid, startGame, tapCell, isGameOver, level } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BEANZ</Text>

      {isGameOver ? (
        <GameOverPanel
          score={score}
          onPlayAgain={() => startGame(1)}
          onLevel2={() => startGame(2)}
        />
      ) : (
        <ScoreBoard
          timeLeft={timeLeft}
          score={score}
          isRunning={isRunning}
          onStart={() => startGame(level)}
        />
      )}

      <BeanGrid
        grid={grid}
        gridSize={LEVELS[level].gridSize}
        onTap={tapCell}
        disabled={isGameOver || !isRunning}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 48,
  },
  title: {
    color: '#FFFF00',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
