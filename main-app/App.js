import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import ZonesScreen from './screens/ZonesScreen';
import MusicScreen from './screens/MusicScreen';
import PlaylistsScreen from './screens/PlaylistsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Context
import { MusicProvider } from './context/MusicContext';
import { MQTTProvider } from './context/MQTTContext';
import { ZoneProvider } from './context/ZoneContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <MQTTProvider>
        <ZoneProvider>
          <MusicProvider>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                      iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Zones') {
                      iconName = focused ? 'location' : 'location-outline';
                    } else if (route.name === 'Music') {
                      iconName = focused ? 'musical-notes' : 'musical-notes-outline';
                    } else if (route.name === 'Playlists') {
                      iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Settings') {
                      iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                  },
                  tabBarActiveTintColor: '#4CAF50',
                  tabBarInactiveTintColor: 'gray',
                  tabBarStyle: {
                    backgroundColor: '#1a1a1a',
                    borderTopColor: '#333',
                  },
                  headerStyle: {
                    backgroundColor: '#1a1a1a',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                })}
              >
                <Tab.Screen 
                  name="Dashboard" 
                  component={DashboardScreen} 
                  options={{ title: 'Dashboard' }}
                />
                <Tab.Screen 
                  name="Zones" 
                  component={ZonesScreen} 
                  options={{ title: 'Zones' }}
                />
                <Tab.Screen 
                  name="Music" 
                  component={MusicScreen} 
                  options={{ title: 'Music Control' }}
                />
                <Tab.Screen 
                  name="Playlists" 
                  component={PlaylistsScreen} 
                  options={{ title: 'Playlists' }}
                />
                <Tab.Screen 
                  name="Settings" 
                  component={SettingsScreen} 
                  options={{ title: 'Settings' }}
                />
              </Tab.Navigator>
              <StatusBar style="light" />
            </NavigationContainer>
          </MusicProvider>
        </ZoneProvider>
      </MQTTProvider>
    </SafeAreaProvider>
  );
}

