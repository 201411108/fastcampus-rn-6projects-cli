import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { HomeScreenProps } from '../types/navigator';
import useRecords from '../hooks/useRecords';
import RecordItem from '../components/RecordItem';
import { FoodRecord } from '../types/record';
import { useCallback, useRef, useState } from 'react';
import RecordDetailModal from '../components/RecordDetailModal';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
  ? 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'
  : '';

function HomeScreen({ navigation }: HomeScreenProps) {
  const { hasPermission, requestPermission } = useCameraPermission();

  const handlePressCamera = () => {
    if (!hasPermission) {
      requestPermission();
    }
    navigation.navigate('Camera');
  };

  const { records, isLoading, deleteRecord } = useRecords();

  const [selectedRecord, setSelectedRecord] = useState<FoodRecord | null>(null);

  const handlePressRecordItem = useCallback((record: FoodRecord) => {
    setSelectedRecord(record);
  }, []);

  const handleCloseRecordDetailModal = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const handleLongPressRecordItem = useCallback(
    (record: FoodRecord) => {
      Alert.alert(
        '기록 삭제',
        `${record.analysisResult.food_name}을 삭제하시겠습니까?`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              deleteRecord(record.id);
            },
          },
        ],
      );
    },
    [deleteRecord],
  );

  const bannerRef = useRef<BannerAd>(null);

  useForeground(() => {
    Platform.OS === 'ios' && bannerRef.current?.load();
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <BannerAd
        ref={bannerRef}
        unitId={adUnitId}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
      />

      <FlatList
        data={records}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RecordItem
            key={item.id}
            record={item}
            onPress={() => handlePressRecordItem(item)}
            onLongPress={() => handleLongPressRecordItem(item)}
          />
        )}
        style={{ width: '100%' }}
        contentContainerStyle={{ gap: 16 }}
      />
      <Pressable
        onPress={handlePressCamera}
        style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'black',
          padding: 10,
          marginTop: 20,
        }}
      >
        <Text>카메라 활성화</Text>
      </Pressable>

      <RecordDetailModal
        selectedRecord={selectedRecord}
        onClose={handleCloseRecordDetailModal}
      />
    </View>
  );
}

export default HomeScreen;
