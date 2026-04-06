import { PermissionsAndroid, Platform } from 'react-native';

export async function ensureAndroidActivityRecognitionPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION;
  if (!permission) {
    return true;
  }

  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    title: '걸음 수 권한 요청',
    message: '걸음 수 센서를 읽으려면 활동 인식 권한이 필요합니다.',
    buttonPositive: '허용',
    buttonNegative: '취소',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
}
