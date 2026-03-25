import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import useAIAnalysis from '../hooks/useAIAnalysis';
import useRecords from '../hooks/useRecords';

import { CameraScreenProps } from '../types/navigator';
import useInterstitial from '../hooks/useIntersitial';

function CameraScreen({ navigation }: CameraScreenProps) {
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();

  const { bottom } = useSafeAreaInsets();

  const cameraRef = useRef<Camera>(null);

  const [photo, setPhoto] = useState<PhotoFile | null>(null);

  const handlePressTakePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    const currentPhoto = await cameraRef.current.takePhoto();
    setPhoto(currentPhoto);
  };

  const handlePressResetPhoto = () => {
    setPhoto(null);
  };

  const { analyzeFoodImage } = useAIAnalysis();
  const { addRecord } = useRecords();

  const { loaded: interstitialLoaded, interstitial } = useInterstitial();

  const handlePressAnalysis = async () => {
    if (!photo) {
      return;
    }

    const result = await analyzeFoodImage(photo.path);

    if (!result) {
      return;
    }

    await addRecord({
      imageUri: result.downloadUrl,
      analysisResult: result.result,
    });

    if (interstitialLoaded) {
      await interstitial.show();
    }
    navigation.goBack();
  };

  if (!hasPermission)
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>No permission</Text>
      </View>
    );

  if (device == null)
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>No Camera device</Text>
      </View>
    );

  if (photo) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: `file://${photo.path}` }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        <View style={[styles.bottomControls, { paddingBottom: bottom + 20 }]}>
          <Pressable
            onPress={handlePressResetPhoto}
            hitSlop={10}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>✕</Text>
          </Pressable>
          <Pressable hitSlop={10} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>✓</Text>
          </Pressable>
          <Pressable hitSlop={10} onPress={handlePressAnalysis}>
            <Text style={styles.actionButtonText}>Analysis</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
      />
      <View style={[styles.bottomControls, { paddingBottom: bottom + 20 }]}>
        <Pressable onPress={handlePressTakePhoto} hitSlop={10}>
          <View style={styles.shutterOuter}>
            <View style={styles.shutterInner} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const SHUTTER_SIZE = 70;
const SHUTTER_INNER_SIZE = 58;
const ACTION_BUTTON_SIZE = 54;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: 'white',
    fontSize: 18,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    gap: 60,
  },
  shutterOuter: {
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    borderRadius: SHUTTER_SIZE / 2,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: SHUTTER_INNER_SIZE,
    height: SHUTTER_INNER_SIZE,
    borderRadius: SHUTTER_INNER_SIZE / 2,
    backgroundColor: 'white',
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

export default CameraScreen;
