import {
  isStepCountingSupported,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  type StepCountData,
} from '@dongminyu/react-native-step-counter';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EventSubscription } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ensureStepSensorPermission } from '../utils/acivityRecognition';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return '걸음 수를 추적하는 중 오류가 발생했습니다.';
}

type StepCounterProps = {
  hasGoalConfigured: boolean;
};

export default function StepCounter({ hasGoalConfigured }: StepCounterProps) {
  const stepSubscriptionRef = useRef<EventSubscription | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('추적을 시작해 주세요.');
  const [errorMessage, setErrorMessage] = useState('');

  const stopTracking = useCallback((nextStatusMessage: string) => {
    stopStepCounterUpdate();
    stepSubscriptionRef.current?.remove();
    stepSubscriptionRef.current = null;
    setIsTracking(false);
    setStatusMessage(nextStatusMessage);
  }, []);

  const startTracking = useCallback(async () => {
    if (isTracking || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const hasPermission = await ensureStepSensorPermission();
      if (!hasPermission) {
        setErrorMessage('걸음 수 권한이 허용되어야 추적을 시작할 수 있습니다.');
        return;
      }

      const supportResult = await isStepCountingSupported();
      if (!supportResult.supported) {
        setErrorMessage('이 기기에서는 걸음 수 추적을 지원하지 않습니다.');
        return;
      }

      if (!supportResult.granted) {
        setErrorMessage(
          '걸음 수 권한이 허용되지 않아 추적을 시작할 수 없습니다.',
        );
        return;
      }

      stopStepCounterUpdate();
      stepSubscriptionRef.current?.remove();
      stepSubscriptionRef.current = null;

      setStepCount(0);
      stepSubscriptionRef.current = startStepCounterUpdate(
        new Date(),
        (data: StepCountData) => {
          setStepCount(data.steps);
        },
      );

      setIsTracking(true);
      setStatusMessage('걸음 수를 추적 중입니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isTracking]);

  const handlePress = useCallback(async () => {
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

  useEffect(() => {
    return () => {
      stopStepCounterUpdate();
      stepSubscriptionRef.current?.remove();
      stepSubscriptionRef.current = null;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실시간 걸음 수</Text>
      <Text style={styles.stepCount}>{stepCount}보</Text>
      <Text style={styles.statusText}>{statusMessage}</Text>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <Pressable
        style={[
          styles.button,
          isTracking ? styles.stopButton : styles.startButton,
          isStartDisabled ? styles.disabledButton : null,
        ]}
        onPress={handlePress}
        disabled={isStartDisabled}
      >
        <Text style={styles.buttonText}>
          {isTracking ? '추적 중지' : '추적 시작'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#fff',
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stepCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  statusText: {
    fontSize: 14,
    color: '#4b5563',
  },
  errorText: {
    fontSize: 14,
    color: '#d92d20',
  },
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#111827',
  },
  stopButton: {
    backgroundColor: '#b42318',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
