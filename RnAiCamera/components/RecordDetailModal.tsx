import { FC } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { FoodRecord } from '../types/record';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RecordDetailModalProps = {
  selectedRecord: FoodRecord | null;
  onClose: () => void;
};

const RecordDetailModal: FC<RecordDetailModalProps> = ({
  selectedRecord,
  onClose,
}) => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <Modal
      visible={!!selectedRecord}
      onRequestClose={onClose}
      transparent
      animationType="fade"
    >
      <View
        style={[
          styles.overlay,
          {
            paddingTop: top,
            paddingBottom: bottom + 16,
          },
        ]}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.modalTitle}>
            {selectedRecord?.analysisResult.food_name}
          </Text>
          <Text style={styles.modalCalorieText}>
            {selectedRecord?.analysisResult.calories} kcal
          </Text>
          <Text style={styles.modalNutritionText}>
            탄수화물 : {selectedRecord?.analysisResult.nutrition.carbs}g
          </Text>
          <Text style={styles.modalNutritionText}>
            단백질 : {selectedRecord?.analysisResult.nutrition.protein}g
          </Text>
          <Text style={styles.modalNutritionText}>
            지방 : {selectedRecord?.analysisResult.nutrition.fat}g
          </Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeButton}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 350,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalCalorieText: {
    fontSize: 32,
    fontWeight: '500',
    color: 'blue',
    textAlign: 'center',
  },
  modalNutritionText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  closeButton: {
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
  },
});

export default RecordDetailModal;
