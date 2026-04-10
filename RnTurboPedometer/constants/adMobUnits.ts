import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const RELEASE_HOME_BANNER_AD_UNIT_ID_ANDROID =
  'ca-app-pub-5955022603563417/7942813666';

const RELEASE_HOME_BANNER_AD_UNIT_ID_IOS =
  'ca-app-pub-5955022603563417/6901194730';

const PROD_BANNER_AD_UNIT_ID =
  Platform.select({
    android: RELEASE_HOME_BANNER_AD_UNIT_ID_ANDROID,
    ios: RELEASE_HOME_BANNER_AD_UNIT_ID_IOS,
  }) ?? TestIds.ADAPTIVE_BANNER;

export const homeBannerAdUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : PROD_BANNER_AD_UNIT_ID;

/**
 * 목표 달성 AI 인사이트 요청 시 사용할 전면 광고 단위 ID (OS별).
 * AdMob 콘솔에서 전면 단위를 만든 뒤 `ca-app-pub-.../...` 형식으로 교체하세요.
 */
const RELEASE_GOAL_INSIGHT_INTERSTITIAL_AD_UNIT_ID_ANDROID =
  'ca-app-pub-5955022603563417/4302951550';

const RELEASE_GOAL_INSIGHT_INTERSTITIAL_AD_UNIT_ID_IOS =
  'ca-app-pub-5955022603563417/8403358959';

const PROD_GOAL_INSIGHT_INTERSTITIAL_AD_UNIT_ID =
  Platform.select({
    android: RELEASE_GOAL_INSIGHT_INTERSTITIAL_AD_UNIT_ID_ANDROID,
    ios: RELEASE_GOAL_INSIGHT_INTERSTITIAL_AD_UNIT_ID_IOS,
  }) ?? RELEASE_GOAL_INSIGHT_INTERSTITIAL_AD_UNIT_ID_ANDROID;

export const goalInsightInterstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : PROD_GOAL_INSIGHT_INTERSTITIAL_AD_UNIT_ID;
