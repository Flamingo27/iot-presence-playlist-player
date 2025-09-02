import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatusScreen from './screens/StatusScreen';

// Context
import { SensorProvider } from './context/SensorContext';
import { MQTTProvider } from './context/MQTTContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <MQTTProvider>
        <SensorProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#1a1a1a',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ title: 'IoT Sensor' }}
              />
              <Stack.Screen 
                name="Camera" 
                component={CameraScreen} 
                options={{ title: 'Presence Detection' }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ title: 'Settings' }}
              />
              <Stack.Screen 
                name="Status" 
                component={StatusScreen} 
                options={{ title: 'System Status' }}
              />
            </Stack.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
        </SensorProvider>
      </MQTTProvider>
    </SafeAreaProvider>
  );
}

