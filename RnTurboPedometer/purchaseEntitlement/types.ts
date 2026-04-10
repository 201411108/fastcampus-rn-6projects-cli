/**
 * 로컬 스토어 또는 향후 서버 검증 구현체가 동일하게 맞춰야 하는 권한 상태.
 * 서버 연동 시 Provider 구현만 교체하면 화면·훅은 그대로 둘 수 있습니다.
 */
export type PurchaseEntitlementValue = {
  /** `availablePurchases`에 비소모성 광고 제거 상품이 있는지(스토어 기준). */
  isAdFree: boolean;
  /**
   * 전면·배너 광고 숨김에 사용. 동기화 중에는 캐시가 true이면 낙관적으로 숨깁니다.
   * 서버 검증 도입 시 이 필드만 서버 응답으로 대체하면 됩니다.
   */
  shouldHideAds: boolean;
  /** 스토어(IAP) 연결 완료 여부 */
  isStoreConnected: boolean;
  /** 상품 조회·보유 구매 동기화 중 */
  isEntitlementLoading: boolean;
  lastEntitlementError: string | null;
  adFreeProductTitle: string | null;
  adFreeProductDisplayPrice: string | null;
  refreshEntitlement: () => Promise<void>;
  requestAdFreePurchase: () => Promise<void>;
  restorePurchases: () => Promise<void>;
};
