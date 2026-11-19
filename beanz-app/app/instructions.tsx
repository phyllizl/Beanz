import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function InstructionsScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleNameChange = (text: string) => {
    setName(text.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>INSTRUCTIONS</Text>

      <View style={styles.rule}>
        <Text style={styles.text}>
          Tap on as many Green Beans{' '}
        </Text>
        <Image source={require('../assets/greenbean_bounce.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          {' '}as possible while avoiding the Red Beans{' '}
        </Text>
        <Image source={require('../assets/redbean_bounce.gif')} style={styles.inlineImage} />
        <Text style={styles.text}>
          ! If you spot the Magic Beans{' '}
        </Text>
        <Image source={require('../assets/magicbean.png')} style={styles.inlineImage} />
        <Text style={styles.text}>
          , act fast and tap them for bonus points!
        </Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Green Bean → Sprout{' '}
        </Text>
        <Image source={require('../assets/sprout.png')} style={styles.inlineImage} />
        <Text style={styles.text}> = +5 points</Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Magic Bean → Star{' '}
        </Text>
        <Image source={require('../assets/star.png')} style={styles.inlineImage} />
        <Text style={styles.text}> = +8 points</Text>
      </View>

      <View style={styles.scoring}>
        <Text style={styles.text}>
          Red Bean → Monster{' '}
        </Text>
        <Image source={require('../assets/monster.png')} style={styles.inlineImage} />
        <Text style={styles.text}> = -3 points</Text>
      </View>

      <Text style={styles.nameLabel}>ENTER YOUR NAME AND START PLAYING</Text>
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={handleNameChange}
        maxLength={3}
        autoCapitalize="characters"
        placeholder="AAA"
        placeholderTextColor="#666666"
      />

      <Pressable
        style={[styles.button, name.length !== 3 && styles.buttonDisabled]}
        onPress={() => name.length === 3 && router.push({ pathname: '/game', params: { playerName: name } })}
      >
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
  nameLabel: {
    color: '#FFFF00',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 8,
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
    marginBottom: 8,
    letterSpacing: 12,
  },
  button: {
    backgroundColor: '#FFFF00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
