import {
  isStepCountingSupported,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  type StepCountData,
} from '@dongminyu/react-native-step-counter';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { EventSubscription } from 'react-native';
import { usePurchaseEntitlement } from './PurchaseEntitlementContext';
import { useStepCounterBackgroundSync } from '../hooks/useStepCounterBackgroundSync';
import { useStepInsightAutoTrigger } from '../hooks/useStepInsightAutoTrigger';
import {
  startForegroundStepTrackingService,
  stopForegroundStepTrackingService,
} from '../services/stepForegroundService';
import { ensureBackgroundStepPermissions } from '../utils/acivityRecognition';
import type { StepInsightHistoryItem, StepInsightResult } from '../types/stepInsight';

type StepTrackingContextValue = {
  goalStepCount: number | null;
  setGoalStepCount: (goalStepCount: number) => void;
  stepCount: number;
  isTracking: boolean;
  isProcessing: boolean;
  statusMessage: string;
  errorMessage: string;
  isGeneratingStepInsight: boolean;
  stepInsightErrorMessage: string;
  stepInsightResult: StepInsightResult;
  stepInsightHistory: StepInsightHistoryItem[];
  refreshStepInsightHistory: () => Promise<void>;
  canRegenerateStepInsight: boolean;
  isStartDisabled: boolean;
  handleTrackingButtonPress: () => Promise<void>;
  regenerateStepInsight: () => void;
};

const StepTrackingContext = createContext<StepTrackingContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return '걸음 수를 추적하는 중 오류가 발생했습니다.';
}

function getPermissionName(permission: string) {
  if (permission === 'activityRecognition') {
    return '활동 인식';
  }
  if (permission === 'motion') {
    return '모션 및 피트니스';
  }
  if (permission === 'notifications') {
    return '알림';
  }
  return permission;
}

function getPermissionErrorMessage(
  status: 'denied' | 'blocked',
  missingPermissions: string[],
) {
  const permissionNames = missingPermissions.map(getPermissionName).join(', ');
  if (status === 'blocked') {
    return `${permissionNames} 권한이 차단되어 있어 설정에서 직접 허용해야 합니다.`;
  }

  return `${permissionNames} 권한이 허용되어야 추적을 시작할 수 있습니다.`;
}

type StepTrackingProviderProps = {
  children: ReactNode;
};

export function StepTrackingProvider({ children }: StepTrackingProviderProps) {
  const { shouldHideAds } = usePurchaseEntitlement();

  const stepSubscriptionRef = useRef<EventSubscription | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const [goalStepCount, setGoalStepCountState] = useState<number | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('추적을 시작해 주세요.');
  const [errorMessage, setErrorMessage] = useState('');
  const hasGoalConfigured = goalStepCount !== null;

  useStepCounterBackgroundSync({
    isTracking,
    sessionStartRef,
    setStepCount,
    setStatusMessage,
    setErrorMessage,
  });

  const {
    isGeneratingStepInsight,
    stepInsightErrorMessage,
    stepInsightResult,
    stepInsightHistory,
    refreshStepInsightHistory,
    regenerateStepInsight,
    resetStepInsightAutoTrigger,
  } = useStepInsightAutoTrigger({
    isTracking,
    stepCount,
    goalStepCount,
    shouldHideAds,
  });

  const setGoalStepCount = useCallback((nextGoalStepCount: number) => {
    setGoalStepCountState(nextGoalStepCount);
  }, []);

  const startStepUpdateSession = useCallback(
    (sessionStartDate: Date, options?: { resetCount?: boolean }) => {
      stopStepCounterUpdate();
      stepSubscriptionRef.current?.remove();
      stepSubscriptionRef.current = null;

      if (options?.resetCount) {
        setStepCount(0);
      }

      stepSubscriptionRef.current = startStepCounterUpdate(
        sessionStartDate,
        (data: StepCountData) => {
          setStepCount(data.steps);
        },
      );
    },
    [],
  );

  const stopTracking = useCallback(
    (nextStatusMessage: string) => {
      stopForegroundStepTrackingService().catch(() => {});
      stopStepCounterUpdate();
      stepSubscriptionRef.current?.remove();
      stepSubscriptionRef.current = null;
      sessionStartRef.current = null;
      resetStepInsightAutoTrigger();
      setIsTracking(false);
      setStatusMessage(nextStatusMessage);
    },
    [resetStepInsightAutoTrigger],
  );

  const startTracking = useCallback(async () => {
    if (isTracking || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    let isAndroidForegroundServiceStarted = false;

    try {
      const permissionResult = await ensureBackgroundStepPermissions();
      if (permissionResult.status !== 'granted') {
        setErrorMessage(
          getPermissionErrorMessage(
            permissionResult.status,
            permissionResult.missingPermissions,
          ),
        );
        return;
      }

      const supportResult = await isStepCountingSupported();
      if (!supportResult.supported) {
        setErrorMessage('이 기기에서는 걸음 수 추적을 지원하지 않습니다.');
        return;
      }

      if (!supportResult.granted) {
        setErrorMessage('걸음 수 권한이 허용되지 않아 추적을 시작할 수 없습니다.');
        return;
      }

      await startForegroundStepTrackingService();
      isAndroidForegroundServiceStarted = true;

      const sessionStartDate = new Date();
      sessionStartRef.current = sessionStartDate;
      resetStepInsightAutoTrigger();
      startStepUpdateSession(sessionStartDate, { resetCount: true });

      setIsTracking(true);
      setStatusMessage('걸음 수를 추적 중입니다.');
    } catch (error) {
      if (isAndroidForegroundServiceStarted) {
        stopForegroundStepTrackingService().catch(() => {});
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isTracking, resetStepInsightAutoTrigger, startStepUpdateSession]);

  const handleTrackingButtonPress = useCallback(async () => {
    if (isTracking) {
      stopTracking('추적이 중지되었습니다.');
      return;
    }

    if (!hasGoalConfigured) {
      setErrorMessage('목표 걸음수를 먼저 설정해 주세요.');
      setStatusMessage('목표 설정 후 추적을 시작할 수 있습니다.');
      return;
    }

    await startTracking();
  }, [hasGoalConfigured, isTracking, startTracking, stopTracking]);

  const isStartDisabled = !isTracking && (!hasGoalConfigured || isProcessing);
  const canRegenerateStepInsight =
    isTracking &&
    goalStepCount !== null &&
    goalStepCount > 0 &&
    stepCount >= goalStepCount;

  useEffect(() => {
    return () => {
      stopForegroundStepTrackingService().catch(() => {});
      stopStepCounterUpdate();
      stepSubscriptionRef.current?.remove();
      stepSubscriptionRef.current = null;
    };
  }, []);

  const contextValue = useMemo<StepTrackingContextValue>(
    () => ({
      goalStepCount,
      setGoalStepCount,
      stepCount,
      isTracking,
      isProcessing,
      statusMessage,
      errorMessage,
      isGeneratingStepInsight,
      stepInsightErrorMessage,
      stepInsightResult,
      stepInsightHistory,
      refreshStepInsightHistory,
      canRegenerateStepInsight,
      isStartDisabled,
      handleTrackingButtonPress,
      regenerateStepInsight,
    }),
    [
      canRegenerateStepInsight,
      errorMessage,
      goalStepCount,
      handleTrackingButtonPress,
      isGeneratingStepInsight,
      isProcessing,
      isStartDisabled,
      isTracking,
      regenerateStepInsight,
      setGoalStepCount,
      statusMessage,
      stepCount,
      stepInsightErrorMessage,
      stepInsightHistory,
      stepInsightResult,
      refreshStepInsightHistory,
    ],
  );

  return (
    <StepTrackingContext.Provider value={contextValue}>
      {children}
    </StepTrackingContext.Provider>
  );
}

export function useStepTrackingContext() {
  const context = useContext(StepTrackingContext);
  if (!context) {
    throw new Error('useStepTrackingContext는 StepTrackingProvider 내부에서 사용해야 합니다.');
  }
  return context;
}
