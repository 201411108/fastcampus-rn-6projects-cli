import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  isAvailable: () => Promise<boolean>;
  getStepCount: () => Promise<number>;
  getSensorName: () => Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeStepSensor');
