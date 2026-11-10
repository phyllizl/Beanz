import { View, Text, StyleSheet } from 'react-native';
import { useGame } from '../hooks/useGame';
import { BeanGrid } from '../components/BeanGrid';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameOverPanel } from '../components/GameOverPanel';
import { WaveCompletePanel } from '../components/WaveCompletePanel';
import { getWaveConfig } from '../constants/game';

export default function GameScreen() {
  const { score, waveScore, timeLeft, gamePhase, grid, wave, startGame, nextWave, tapCell } = useGame();

  const isPlaying = gamePhase === 'playing';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BEANZ</Text>

      {gamePhase === 'game-over' && (
        <GameOverPanel score={score} wave={wave} onPlayAgain={startGame} />
      )}

      {gamePhase === 'victory' && (
        <GameOverPanel score={score} wave={wave} onPlayAgain={startGame} />
      )}

      {gamePhase === 'wave-complete' && (
        <WaveCompletePanel
          wave={wave}
          waveScore={waveScore}
          totalScore={score}
          onNextWave={nextWave}
        />
      )}

      {(gamePhase === 'idle' || gamePhase === 'playing') && (
        <ScoreBoard
          timeLeft={timeLeft}
          score={score}
          wave={wave}
          isRunning={isPlaying}
          onStart={startGame}
        />
      )}

      <BeanGrid
        grid={grid}
        gridSize={getWaveConfig(wave).gridSize}
        onTap={tapCell}
        disabled={!isPlaying}
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
