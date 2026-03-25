import { FC } from 'react';
import { FoodRecord } from '../types/record';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type RecordItemProps = {
  record: FoodRecord;
  onPress: () => void;
  onLongPress: () => void;
};

const RecordItem: FC<RecordItemProps> = ({ record, onPress, onLongPress }) => {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Image
        source={{
          uri: record.imageUri,
        }}
        style={styles.image}
      />
      <View style={styles.itemContainer}>
        <Text style={styles.foodName}>{record.analysisResult.food_name}</Text>
        <Text style={styles.calorieText}>
          {record.analysisResult.calories} kcal
        </Text>
        <Text style={styles.nutritionText}>
          탄수화물 : {record.analysisResult.nutrition.carbs}g
        </Text>
        <Text style={styles.nutritionText}>
          단백질 : {record.analysisResult.nutrition.protein}g
        </Text>
        <Text style={styles.nutritionText}>
          지방 : {record.analysisResult.nutrition.fat}g
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  itemContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  calorieText: {
    fontSize: 14,
  },
  nutritionText: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default RecordItem;
