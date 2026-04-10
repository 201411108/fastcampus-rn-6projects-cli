import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { finishTransaction, useIAP } from 'react-native-iap';
import {
  getAdFreeProductSku,
  hasAdFreeProductInPurchases,
} from '../constants/iapProducts';
import type { PurchaseEntitlementValue } from '../purchaseEntitlement/types';

const AD_FREE_CACHE_KEY = 'purchase_entitlement_ad_free';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 스토어(IAP)만으로 광고 제거 권한을 판별합니다.
 * 서버 검증 도입 시 이 훅을 `useServerPurchaseEntitlement` 등으로 교체하면 됩니다.
 * 클라이언트만으로는 영수증 위변조에 완전히 대응할 수 없습니다.
 */
export function useLocalPurchaseEntitlement(): PurchaseEntitlementValue {
  const [lastEntitlementError, setLastEntitlementError] = useState<
    string | null
  >(null);
  const [cachedAdFree, setCachedAdFree] = useState<boolean | null>(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    connected,
    products,
    availablePurchases,
    fetchProducts,
    getAvailablePurchases,
    requestPurchase,
    restorePurchases: restorePurchasesFromStore,
  } = useIAP({
    onPurchaseSuccess: async purchase => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch (error) {
        console.warn('finishTransaction 실패', error);
      }
    },
    onPurchaseError: error => {
      setLastEntitlementError(error.message ?? '구매에 실패했습니다.');
    },
    onError: error => {
      setLastEntitlementError(error.message);
    },
  });

  const sku = getAdFreeProductSku();

  const isAdFree = useMemo(
    () => hasAdFreeProductInPurchases(availablePurchases),
    [availablePurchases],
  );

  useEffect(() => {
    AsyncStorage.getItem(AD_FREE_CACHE_KEY)
      .then(value => {
        if (value === 'true') {
          setCachedAdFree(true);
        } else if (value === 'false') {
          setCachedAdFree(false);
        }
      })
      .finally(() => {
        setCacheLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!cacheLoaded) {
      return;
    }
    AsyncStorage.setItem(AD_FREE_CACHE_KEY, isAdFree ? 'true' : 'false').catch(
      () => {},
    );
    setCachedAdFree(isAdFree);
  }, [cacheLoaded, isAdFree]);

  const refreshEntitlement = useCallback(async () => {
    if (!connected) {
      setLastEntitlementError('스토어에 연결되지 않았습니다.');
      return;
    }
    setIsSyncing(true);
    setLastEntitlementError(null);
    try {
      await fetchProducts({ skus: [sku], type: 'in-app' });
      await getAvailablePurchases();
    } catch (error) {
      setLastEntitlementError(getErrorMessage(error));
    } finally {
      setIsSyncing(false);
    }
  }, [connected, fetchProducts, getAvailablePurchases, sku]);

  useEffect(() => {
    if (!connected) {
      return;
    }
    refreshEntitlement();
  }, [connected, refreshEntitlement]);

  const requestAdFreePurchase = useCallback(async () => {
    if (!connected) {
      setLastEntitlementError('스토어에 연결되지 않았습니다.');
      return;
    }
    setLastEntitlementError(null);
    try {
      if (Platform.OS === 'ios') {
        await requestPurchase({
          type: 'in-app',
          request: { apple: { sku } },
        });
      } else {
        await requestPurchase({
          type: 'in-app',
          request: { google: { skus: [sku] } },
        });
      }
    } catch (error) {
      setLastEntitlementError(getErrorMessage(error));
    }
  }, [connected, requestPurchase, sku]);

  const restorePurchases = useCallback(async () => {
    if (!connected) {
      setLastEntitlementError('스토어에 연결되지 않았습니다.');
      return;
    }
    setLastEntitlementError(null);
    try {
      await restorePurchasesFromStore();
    } catch (error) {
      setLastEntitlementError(getErrorMessage(error));
    }
  }, [connected, restorePurchasesFromStore]);

  const adFreeProduct = useMemo(
    () => products.find(p => p.id === sku) ?? null,
    [products, sku],
  );

  const isEntitlementLoading = !connected || isSyncing;

  const shouldHideAds =
    isAdFree || (isEntitlementLoading && cacheLoaded && cachedAdFree === true);

  return {
    isAdFree,
    shouldHideAds,
    isStoreConnected: connected,
    isEntitlementLoading,
    lastEntitlementError,
    adFreeProductTitle: adFreeProduct?.title ?? null,
    adFreeProductDisplayPrice: adFreeProduct?.displayPrice ?? null,
    refreshEntitlement,
    requestAdFreePurchase,
    restorePurchases,
  };
}
