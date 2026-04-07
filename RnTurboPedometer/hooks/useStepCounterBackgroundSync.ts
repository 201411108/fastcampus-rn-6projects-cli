import { Platform } from 'react-native';
import { useStepCounterBackgroundSync as useAndroidStepCounterBackgroundSync } from './useStepCounterBackgroundSync.android';
import { useStepCounterBackgroundSync as useIosStepCounterBackgroundSync } from './useStepCounterBackgroundSync.ios';

type UseStepCounterBackgroundSyncParams = Parameters<
  typeof useIosStepCounterBackgroundSync
>[0];

export function useStepCounterBackgroundSync(
  params: UseStepCounterBackgroundSyncParams,
) {
  if (Platform.OS === 'ios') {
    return useIosStepCounterBackgroundSync(params);
  }

  return useAndroidStepCounterBackgroundSync(params);
}
