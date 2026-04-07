import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Home: undefined;
  History: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Home'
>;

export type HistoryScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'History'
>;
