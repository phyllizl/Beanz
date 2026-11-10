import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function InstructionsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>INSTRUCTIONS</Text>

      <View style={styles.rule}>
        <Text style={styles.text}>
          Tap on as many Green Beans{' '}
        </Text>
        <Image source={require('../assets/greenbean.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          {' '}as possible while avoiding the Red Beans{' '}
        </Text>
        <Image source={require('../assets/3dgifmaker89063.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          ! If you spot the Magic Beans{' '}
        </Text>
        <Image source={require('../assets/magicBeans.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          , act fast and tap them for bonus points!
        </Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Green Bean → Sprout{' '}
        </Text>
        <Image source={require('../assets/greenSoil.png')} style={styles.inlineImage} />
        <Text style={styles.text}> = +5 points</Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Magic Bean → Star{' '}
        </Text>
        <Image source={require('../assets/newstar.png')} style={styles.inlineImage} />
        <Text style={styles.text}> = +8 points</Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Red Bean → Monster{' '}
        </Text>
        <Image source={require('../assets/monster.gif')} style={styles.inlineImage} />
        <Text style={styles.text}> = -3 points</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.push('/game')}>
        <Text style={styles.buttonText}>PLAY NOW</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFF00',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  rule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scoring: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    color: '#FFFF00',
    fontSize: 16,
  },
  inlineImage: {
    width: 30,
    height: 30,
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  buttonText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
