import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ensureStepSensorPermission } from './utils/acivityRecognition';
import { useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import { RootTabParamList } from './types/navigator';
import { StepTrackingProvider } from './contexts/StepTrackingContext';

const RootTab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  useEffect(() => {
    let mounted = true;

    async function bootstrapStepSensorPermission() {
      try {
        await ensureStepSensorPermission();
      } catch (error) {
        if (!mounted) {
          return;
        }
        console.warn('걸음 센서 권한 확인 중 오류가 발생했습니다.', error);
      }
    }

    bootstrapStepSensorPermission();

    return () => {
      mounted = false;
    };
  }, []);

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
          </RootTab.Navigator>
        </NavigationContainer>
      </StepTrackingProvider>
    </KeyboardProvider>
  );
}
