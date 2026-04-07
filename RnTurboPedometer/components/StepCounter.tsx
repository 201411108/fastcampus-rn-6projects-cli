import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStepTrackingContext } from '../contexts/StepTrackingContext';
import StepInsightResultCard from './StepInsightResultCard';
import StepProgressRing from './StepProgressRing';

export default function StepCounter() {
  const {
    goalStepCount,
    stepCount,
    isTracking,
    statusMessage,
    errorMessage,
    isGeneratingStepInsight,
    stepInsightErrorMessage,
    stepInsightResult,
    canRegenerateStepInsight,
    isStartDisabled,
    handleTrackingButtonPress,
    regenerateStepInsight,
  } = useStepTrackingContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실시간 걸음 수</Text>
      <StepProgressRing stepCount={stepCount} goalStepCount={goalStepCount} />
      <Text style={styles.statusText}>{statusMessage}</Text>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <StepInsightResultCard
        isGenerating={isGeneratingStepInsight}
        errorMessage={stepInsightErrorMessage}
        result={stepInsightResult}
        canRegenerate={canRegenerateStepInsight}
        onRegenerate={regenerateStepInsight}
      />
      <Pressable
        style={[
          styles.button,
          isTracking ? styles.stopButton : styles.startButton,
          isStartDisabled ? styles.disabledButton : null,
        ]}
        onPress={handleTrackingButtonPress}
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
