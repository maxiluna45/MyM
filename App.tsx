import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CalendarScreen from './src/screens/CalendarScreen';
import PhotosScreen from './src/screens/PhotosScreen';
import { EventsProvider } from './src/context/EventsContext';

import './global.css';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <EventsProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Calendar') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Photos') {
                iconName = focused ? 'images' : 'images-outline';
              }

              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3B38A0', // azul
            tabBarInactiveTintColor: '#9ca3af', // gris
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6',
              paddingBottom: 10,
              height: 90,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerShown: true,
          })}>
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ title: 'Calendario' }}
          />
          <Tab.Screen name="Photos" component={PhotosScreen} options={{ title: 'Álbum' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </EventsProvider>
  );
}
