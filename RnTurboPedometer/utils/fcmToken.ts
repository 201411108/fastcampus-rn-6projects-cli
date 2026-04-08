import messaging from '@react-native-firebase/messaging';

type FcmPermissionStatus = 'authorized' | 'provisional' | 'denied';

function mapAuthorizationStatus(
  status: number,
): FcmPermissionStatus {
  if (status === messaging.AuthorizationStatus.AUTHORIZED) {
    return 'authorized';
  }
  if (status === messaging.AuthorizationStatus.PROVISIONAL) {
    return 'provisional';
  }
  return 'denied';
}

export async function requestFcmPermission(): Promise<FcmPermissionStatus> {
  const authStatus = await messaging().requestPermission();
  return mapAuthorizationStatus(authStatus);
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch {
    return null;
  }
}

export async function requestFcmPermissionAndGetToken(): Promise<{
  permissionStatus: FcmPermissionStatus;
  token: string | null;
}> {
  const permissionStatus = await requestFcmPermission();

  if (permissionStatus === 'denied') {
    return { permissionStatus, token: null };
  }

  const token = await getFcmToken();
  return { permissionStatus, token };
}

export function onFcmTokenRefresh(callback: (token: string) => void) {
  return messaging().onTokenRefresh(callback);
}
