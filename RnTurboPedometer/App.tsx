import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { RootTabParamList } from './types/navigator';
import { StepTrackingProvider } from './contexts/StepTrackingContext';
import { useAppBootstrap } from './hooks/useAppBootstrap';

const RootTab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  useAppBootstrap();

  return (
    <KeyboardProvider>
      <StepTrackingProvider>
        <NavigationContainer>
          <RootTab.Navigator initialRouteName="Home">
            <RootTab.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: '홈' }}
            />
            <RootTab.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: '기록' }}
            />
            <RootTab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: '정보' }}
            />
          </RootTab.Navigator>
        </NavigationContainer>
      </StepTrackingProvider>
    </KeyboardProvider>
  );
}
