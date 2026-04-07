import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import StepInsightHistoryList from '../components/StepInsightHistoryList';
import { useStepTrackingContext } from '../contexts/StepTrackingContext';
import type { HistoryScreenProps } from '../types/navigator';

export default function HistoryScreen({}: HistoryScreenProps) {
  const { stepInsightHistory, refreshStepInsightHistory } = useStepTrackingContext();

  useFocusEffect(
    useCallback(() => {
      refreshStepInsightHistory();
    }, [refreshStepInsightHistory]),
  );

  return (
    <View style={styles.container}>
      <StepInsightHistoryList items={stepInsightHistory} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
});
