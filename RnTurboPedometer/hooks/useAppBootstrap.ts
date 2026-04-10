import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { ensureStepSensorPermission } from '../utils/acivityRecognition';
import {
  onFcmTokenRefresh,
  requestFcmPermissionAndGetToken,
} from '../utils/fcmToken';

export function useAppBootstrap() {
  useEffect(() => {
    async function bootstrapStepSensorPermission() {
      try {
        await ensureStepSensorPermission();
      } catch (error) {
        console.warn('걸음 센서 권한 확인 중 오류가 발생했습니다.', error);
      }
    }

    bootstrapStepSensorPermission();
  }, []);

  useEffect(() => {
    async function initMobileAds() {
      try {
        await mobileAds().initialize();
      } catch (error) {
        console.warn('Mobile Ads 초기화에 실패했습니다.', error);
      }
    }

    initMobileAds();
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

    const unsubscribeForegroundMessage = messaging().onMessage(
      async remoteMessage => {
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
      },
    );

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForegroundMessage();
    };
  }, []);
}
