import { useEffect, useState } from 'react';
import NativeStepSensor from '../specs/NativeStepSensor';
import { ensureAndroidActivityRecognitionPermission } from '../utils/acivityRecognition';

export function useNativeStepSensor() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [sensorName, setSensorName] = useState('확인 전');
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAvailability() {
      try {
        const [supported, name] = await Promise.all([
          NativeStepSensor.isAvailable(),
          NativeStepSensor.getSensorName(),
        ]);

        if (!mounted) {
          return;
        }

        setAvailable(supported);
        setSensorName(name);
      } catch (nativeError) {
        if (!mounted) {
          return;
        }

        setError(getErrorMessage(nativeError));
      }
    }

    loadAvailability();

    return () => {
      mounted = false;
    };
  }, []);

  async function refreshAvailability() {
    setError(null);
    const granted = await ensureAndroidActivityRecognitionPermission();
    if (!granted) {
      setAvailable(false);
      setError('Android에서는 ACTIVITY_RECOGNITION 권한이 필요합니다.');
      return;
    }

    const supported = await NativeStepSensor.isAvailable();
    setAvailable(supported);
  }

  async function readStepCount() {
    setLoading(true);
    setError(null);

    try {
      const granted = await ensureAndroidActivityRecognitionPermission();
      if (!granted) {
        setAvailable(false);
        setError('Android에서는 ACTIVITY_RECOGNITION 권한이 필요합니다.');
        return;
      }

      const [supported, steps, name] = await Promise.all([
        NativeStepSensor.isAvailable(),
        NativeStepSensor.getStepCount(),
        NativeStepSensor.getSensorName(),
      ]);
      setAvailable(supported);
      setStepCount(steps);
      setSensorName(name);
    } catch (nativeError) {
      setError(getErrorMessage(nativeError));
    } finally {
      setLoading(false);
    }
  }

  return {
    available,
    sensorName,
    stepCount,
    loading,
    error,
    refreshAvailability,
    readStepCount,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return '센서 데이터를 읽는 중 오류가 발생했습니다.';
}
