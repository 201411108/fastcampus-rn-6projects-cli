import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

type UseStepCounterBackgroundSyncParams = {
  isTracking: boolean;
  sessionStartRef: MutableRefObject<Date | null>;
  setStepCount: Dispatch<SetStateAction<number>>;
  setStatusMessage: Dispatch<SetStateAction<string>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
};

export function useStepCounterBackgroundSync(
  _params: UseStepCounterBackgroundSyncParams,
) {
  return;
}
