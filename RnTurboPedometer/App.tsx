import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ensureStepSensorPermission } from './utils/acivityRecognition';
import { requestFcmPermissionAndGetToken, onFcmTokenRefresh } from './utils/fcmToken';
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

  useEffect(() => {
    async function initFcm() {
      const { token } = await requestFcmPermissionAndGetToken();
      if (token) {
        console.log('FCM token:', token);
      }
    }

    initFcm();

    const unsubscribeTokenRefresh = onFcmTokenRefresh(newToken => {
      console.log('FCM token refreshed:', newToken);
    });

    const unsubscribeForegroundMessage = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification) {
        await notifee.displayNotification({
          title: remoteMessage.notification.title ?? '알림',
          body: remoteMessage.notification.body ?? '',
          android: {
            channelId: 'default',
            pressAction: { id: 'default' },
          },
        });
      }
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForegroundMessage();
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
