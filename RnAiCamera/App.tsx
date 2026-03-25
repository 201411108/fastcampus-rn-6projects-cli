import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CamerScreen';
import { RootStackParamList } from './types/navigator';
import { NavigationContainer } from '@react-navigation/native';
import mobileAds from 'react-native-google-mobile-ads';
import { useEffect } from 'react';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const RootStack = createNativeStackNavigator<RootStackParamList>();

mobileAds()
  .initialize()
  .then(() => {
    // Initialization complete!
  });

export default function App() {
  useEffect(() => {
    check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY).then(result => {
      if (result === RESULTS.DENIED) {
        request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home">
        <RootStack.Screen name="Home" component={HomeScreen} />
        <RootStack.Screen name="Camera" component={CameraScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
