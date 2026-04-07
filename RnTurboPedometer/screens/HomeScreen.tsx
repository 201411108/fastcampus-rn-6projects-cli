import { StyleSheet, Text, View } from 'react-native';
import StepGoalInput from '../components/StepGoalInput';
import StepCounter from '../components/StepCounter';
import { HomeScreenProps } from '../types/navigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useStepTrackingContext } from '../contexts/StepTrackingContext';

export default function HomeScreen({}: HomeScreenProps) {
  const { setGoalStepCount } = useStepTrackingContext();

  return (
    <KeyboardAwareScrollView
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.content}>
        <Text style={styles.title}>현재 걸음 수</Text>
        <StepGoalInput onGoalSaved={setGoalStepCount} />
        <StepCounter />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
