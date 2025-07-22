import { MainTabParamList } from '@/types';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import QRScannerScreen from '@/screens/QRScannerScreen';
import ScoreboardScreen from '@/screens/ScoreboardScreen';
import TimerScreen from '@/screens/TimerScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainGameNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Scanner':
              iconName = 'qr-code-scanner';
              break;
            case 'Scoreboard':
              iconName = 'leaderboard';
              break;
            case 'Timer':
              iconName = 'timer';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E1E1E1',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Scanner" 
        component={QRScannerScreen}
        options={{
          tabBarLabel: 'Scanner',
        }}
      />
      <Tab.Screen 
        name="Scoreboard" 
        component={ScoreboardScreen}
        options={{
          tabBarLabel: 'Placar',
        }}
      />
      <Tab.Screen 
        name="Timer" 
        component={TimerScreen}
        options={{
          tabBarLabel: 'Tempo',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainGameNavigator;