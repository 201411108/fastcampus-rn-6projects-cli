import { StyleSheet, Text, View } from 'react-native';
import { HomeScreenProps } from '../types/navigator';
import { useEffect } from 'react';
import { useNativeStepSensor } from '../hooks/useNativeStepSensor';

export default function HomeScreen({}: HomeScreenProps) {
  const nativeStepSensor = useNativeStepSensor();

  useEffect(() => {
    nativeStepSensor.refreshAvailability().then(() => {
      console.log(nativeStepSensor.available);
    });
  }, [nativeStepSensor, nativeStepSensor.available]);

  useEffect(() => {
    const interval = setInterval(() => {
      nativeStepSensor.readStepCount().then(() => {
        console.log(nativeStepSensor.stepCount);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nativeStepSensor, nativeStepSensor.stepCount]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>현재 걸음 수</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
