import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import { RootStackParamList } from './types/navigator';
import { NavigationContainer } from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ensureStepSensorPermission } from './utils/acivityRecognition';
import { useEffect } from 'react';

const RootStack = createNativeStackNavigator<RootStackParamList>();

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
      <NavigationContainer>
        <RootStack.Navigator initialRouteName="Home">
          <RootStack.Screen name="Home" component={HomeScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </KeyboardProvider>
  );
}
