import { Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

type StepSensorPermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

function getStepSensorPermission() {
  if (Platform.OS === 'android') {
    return PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION;
  }

  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.MOTION;
  }

  return null;
}

export async function checkStepSensorPermissionStatus(): Promise<StepSensorPermissionStatus> {
  const permission = getStepSensorPermission();
  if (!permission) {
    return 'unavailable';
  }

  const status = await check(permission);
  if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
    return 'granted';
  }
  if (status === RESULTS.BLOCKED) {
    return 'blocked';
  }
  if (status === RESULTS.UNAVAILABLE) {
    return 'unavailable';
  }

  return 'denied';
}

export async function ensureStepSensorPermission() {
  const permission = getStepSensorPermission();
  if (!permission) {
    return true;
  }

  const currentStatus = await checkStepSensorPermissionStatus();
  if (currentStatus === 'granted' || currentStatus === 'unavailable') {
    return true;
  }
  if (currentStatus === 'blocked') {
    return false;
  }

  const requestedStatus = await request(permission);
  return requestedStatus === RESULTS.GRANTED || requestedStatus === RESULTS.LIMITED;
}

// 기존 호출부 호환용 래퍼
export async function ensureAndroidActivityRecognitionPermission() {
  return ensureStepSensorPermission();
}
