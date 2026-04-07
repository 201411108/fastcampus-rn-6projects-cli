import { useCallback, useEffect, useRef, useState } from 'react';
import {
  generateStepInsightWithAi,
  getEmptyStepInsightResult,
} from '../services/stepInsightAi';

type UseStepInsightAutoTriggerParams = {
  isTracking: boolean;
  stepCount: number;
  goalStepCount: number | null;
};

export function useStepInsightAutoTrigger({
  isTracking,
  stepCount,
  goalStepCount,
}: UseStepInsightAutoTriggerParams) {
  const lastRequestedGoalStepCountRef = useRef<number | null>(null);
  const [isGeneratingStepInsight, setIsGeneratingStepInsight] = useState(false);
  const [stepInsightErrorMessage, setStepInsightErrorMessage] = useState('');
  const [stepInsightResult, setStepInsightResult] = useState(
    getEmptyStepInsightResult(),
  );

  const requestStepInsight = useCallback(
    async (params: { nextStepCount: number; nextGoalStepCount: number }) => {
      const { nextStepCount, nextGoalStepCount } = params;
      if (nextGoalStepCount <= 0 || nextStepCount < 0) {
        return;
      }

      setIsGeneratingStepInsight(true);
      setStepInsightErrorMessage('');

      const progressPercent = (nextStepCount / nextGoalStepCount) * 100;
      const result = await generateStepInsightWithAi({
        stepCount: nextStepCount,
        goalStepCount: nextGoalStepCount,
        progressPercent,
      });

      setStepInsightResult(result.data);
      if (result.isFallback) {
        setStepInsightErrorMessage(
          'AI 인사이트 생성에 실패했습니다. 다시 시도해 주세요.',
        );
      }
      setIsGeneratingStepInsight(false);
    },
    [],
  );

  const resetStepInsightAutoTrigger = useCallback(() => {
    lastRequestedGoalStepCountRef.current = null;
    setStepInsightResult(getEmptyStepInsightResult());
    setStepInsightErrorMessage('');
    setIsGeneratingStepInsight(false);
  }, []);

  const regenerateStepInsight = useCallback(() => {
    if (!isTracking || !goalStepCount || goalStepCount <= 0) {
      setStepInsightErrorMessage('목표 걸음수를 설정하고 추적을 시작해 주세요.');
      return;
    }

    requestStepInsight({
      nextStepCount: stepCount,
      nextGoalStepCount: goalStepCount,
    });
  }, [goalStepCount, isTracking, requestStepInsight, stepCount]);

  useEffect(() => {
    if (!isTracking || !goalStepCount || goalStepCount <= 0) {
      return;
    }
    if (stepCount < goalStepCount) {
      return;
    }
    if (lastRequestedGoalStepCountRef.current === goalStepCount) {
      return;
    }

    lastRequestedGoalStepCountRef.current = goalStepCount;
    requestStepInsight({
      nextStepCount: stepCount,
      nextGoalStepCount: goalStepCount,
    });
  }, [goalStepCount, isTracking, requestStepInsight, stepCount]);

  return {
    isGeneratingStepInsight,
    stepInsightErrorMessage,
    stepInsightResult,
    regenerateStepInsight,
    resetStepInsightAutoTrigger,
  };
}
