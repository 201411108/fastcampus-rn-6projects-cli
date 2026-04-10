import { Platform } from 'react-native';
import type { Purchase } from 'react-native-iap';

/**
 * App Store Connect / Play Console에 등록한 비소모성 상품 ID.
 * 스토어에 등록한 값과 반드시 일치시키세요 (플랫폼별로 다를 수 있음).
 */
export const AD_FREE_PRODUCT_ID_IOS = 'app_store_ad_blocker';

export const AD_FREE_PRODUCT_ID_ANDROID =
  'com.hankim.turbopedometer.remove_ads';

const AD_FREE_PRODUCT_IDS = new Set([
  AD_FREE_PRODUCT_ID_IOS,
  AD_FREE_PRODUCT_ID_ANDROID,
]);

/**
 * 현재 플랫폼에서 조회·구매 요청에 사용할 SKU.
 */
export function getAdFreeProductSku(): string {
  return (
    Platform.select({
      ios: AD_FREE_PRODUCT_ID_IOS,
      default: AD_FREE_PRODUCT_ID_ANDROID,
    }) ?? AD_FREE_PRODUCT_ID_ANDROID
  );
}

export function hasAdFreeProductInPurchases(purchases: Purchase[]): boolean {
  return purchases.some(p => AD_FREE_PRODUCT_IDS.has(p.productId));
}
