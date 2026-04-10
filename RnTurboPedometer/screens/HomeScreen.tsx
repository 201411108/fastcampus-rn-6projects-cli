import { StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import StepGoalInput from '../components/StepGoalInput';
import StepCounter from '../components/StepCounter';
import { homeBannerAdUnitId } from '../constants/adMobUnits';
import { HomeScreenProps } from '../types/navigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { usePurchaseEntitlement } from '../contexts/PurchaseEntitlementContext';
import { useStepTrackingContext } from '../contexts/StepTrackingContext';

export default function HomeScreen({}: HomeScreenProps) {
  const { setGoalStepCount } = useStepTrackingContext();
  const { shouldHideAds } = usePurchaseEntitlement();

  return (
    <KeyboardAwareScrollView
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
    >
      {!shouldHideAds ? (
        <View style={styles.bannerSection}>
          <BannerAd
            unitId={homeBannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            onAdFailedToLoad={error => {
              console.warn('배너 광고를 불러오지 못했습니다.', error);
            }}
          />
        </View>
      ) : null}
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
  bannerSection: {
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: -24,
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
