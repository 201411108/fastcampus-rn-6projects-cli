import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { goalInsightInterstitialAdUnitId } from '../constants/adMobUnits';

/**
 * 전면 광고를 로드·표시하고, 닫히거나 로드·표시에 실패하면 완료됩니다.
 * AI 인사이트 생성과 병렬로 호출해도 한쪽이 막히지 않도록 설계했습니다.
 */
export function showInsightInterstitial(): Promise<void> {
  return new Promise(resolve => {
    let settled = false;
    const ad = InterstitialAd.createForAdRequest(
      goalInsightInterstitialAdUnitId,
    );
    let unsubscribe: () => void = () => {};

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      unsubscribe();
      resolve();
    };

    unsubscribe = ad.addAdEventsListener(({ type }) => {
      switch (type) {
        case AdEventType.LOADED:
          try {
            ad.show();
          } catch {
            finish();
          }
          break;
        case AdEventType.ERROR:
        case AdEventType.CLOSED:
          finish();
          break;
        default:
          break;
      }
    });

    ad.load();
  });
}
