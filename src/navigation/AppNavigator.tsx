import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AdminLoginScreen from '../screens/AdminLoginScreen';
import GameControlScreen from '../screens/GameControlScreen';
import GameResultsScreen from '../screens/GameResultsScreen';
import QRGenerationScreen from '../screens/QRGenerationScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import TeamRegistrationScreen from '../screens/TeamRegistrationScreen';
import TimerScreen from '../screens/TimerScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { MainTabParamList, RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainGameTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'QRScanner') {
            iconName = 'qr-code-scanner';
          } else if (route.name === 'Scoreboard') {
            iconName = 'leaderboard';
          } else if (route.name === 'Timer') {
            iconName = 'timer';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 2,
          borderTopColor: '#E0E0E0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{ tabBarLabel: 'Scanner' }}
      />
      <Tab.Screen 
        name="Scoreboard" 
        component={ScoreboardScreen}
        options={{ tabBarLabel: 'Placar' }}
      />
      <Tab.Screen 
        name="Timer" 
        component={TimerScreen}
        options={{ tabBarLabel: 'Tempo' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F8F9FA' },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="TeamRegistration" component={TeamRegistrationScreen} />
        <Stack.Screen name="MainGame" component={MainGameTabs} />
        <Stack.Screen name="GameResults" component={GameResultsScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="QRGeneration" component={QRGenerationScreen} />
        <Stack.Screen name="GameControl" component={GameControlScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const linking = {
  prefixes: ['/qrcodehunter/'],
  config: {
    screens: {
      Welcome: '',
      TeamRegistration: 'team-registration',
      MainGameTabs: 'main-game',
      GameResults: 'game-results',
      AdminLogin: 'admin-login',
      QRGeneration: 'qr-generation',
      GameControl: 'game-control',
    },
  },
  getPathFromState,
  getStateFromPath,
};
export default AppNavigator;