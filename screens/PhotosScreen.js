import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function PhotosScreen() {
  return (
    <LinearGradient
      colors={['#fce4ec', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="items-center mb-8 pt-4">
            <Text className="text-4xl font-bold text-pink-600 mb-2">
              M&M Photos
            </Text>
            <Text className="text-lg text-purple-700">
              📸 Nuestras memorias juntos
            </Text>
          </View>

          {/* Grid de fotos placeholder */}
          <View className="space-y-4">
            {/* Fila 1 */}
            <View className="flex-row space-x-4">
              <View className="flex-1 h-48 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-4xl mb-2">📷</Text>
                <Text className="text-gray-600 text-center text-sm">
                  Foto reciente
                </Text>
              </View>
              <View className="flex-1 h-48 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-4xl mb-2">📷</Text>
                <Text className="text-gray-600 text-center text-sm">
                  Foto reciente
                </Text>
              </View>
            </View>

            {/* Fila 2 */}
            <View className="flex-row space-x-4">
              <View className="flex-1 h-48 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-4xl mb-2">📷</Text>
                <Text className="text-gray-600 text-center text-sm">
                  Foto antigua
                </Text>
              </View>
              <View className="flex-1 h-48 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-4xl mb-2">📷</Text>
                <Text className="text-gray-600 text-center text-sm">
                  Foto antigua
                </Text>
              </View>
            </View>

            {/* Fila 3 */}
            <View className="flex-row space-x-4">
              <View className="flex-1 h-48 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-4xl mb-2">📷</Text>
                <Text className="text-gray-600 text-center text-sm">
                  Más fotos...
                </Text>
              </View>
              <View className="flex-1 h-48 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-4xl mb-2">📷</Text>
                <Text className="text-gray-600 text-center text-sm">
                  Más fotos...
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});