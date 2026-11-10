import { View, Text } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFF00', fontSize: 36 }}>BEANZ</Text>
    </View>
  );
}
