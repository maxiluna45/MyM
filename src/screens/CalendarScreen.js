import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function CalendarScreen() {
  return (
    <LinearGradient
      colors={['#fce4ec', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View className="flex-1 items-center justify-center p-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-pink-600 mb-2">
            M&M Calendar
          </Text>
          <Text className="text-lg text-purple-700">
            📅 Nuestros momentos especiales
          </Text>
        </View>

        {/* Placeholder para el calendario */}
        <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Calendario
          </Text>
          <View className="h-48 bg-gray-100 rounded-xl items-center justify-center">
            <Text className="text-6xl mb-2">📅</Text>
            <Text className="text-gray-600 text-center">
              Aquí irá el calendario interactivo
            </Text>
          </View>
        </View>

        {/* Botón flotante placeholder */}
        <View className="absolute bottom-8 right-8">
          <View className="bg-pink-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
            <Text className="text-2xl">+</Text>
          </View>
        </View>
      </View>
      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});