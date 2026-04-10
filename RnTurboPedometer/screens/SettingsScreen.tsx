import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PRIVACY_POLICY_URL } from '../constants/legalUrls';
import { usePurchaseEntitlement } from '../contexts/PurchaseEntitlementContext';
import type { SettingsScreenProps } from '../types/navigator';

export default function SettingsScreen({}: SettingsScreenProps) {
  const {
    isAdFree,
    isStoreConnected,
    isEntitlementLoading,
    lastEntitlementError,
    adFreeProductTitle,
    adFreeProductDisplayPrice,
    requestAdFreePurchase,
    restorePurchases,
  } = usePurchaseEntitlement();

  const openPrivacyPolicy = useCallback(async () => {
    const url = PRIVACY_POLICY_URL.trim();
    if (!url) {
      Alert.alert(
        '개인정보 처리방침',
        'constants/legalUrls.ts 파일에 PRIVACY_POLICY_URL을 설정한 뒤 다시 시도해 주세요.',
      );
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('오류', '링크를 열 수 없습니다. URL 형식을 확인해 주세요.');
      return;
    }
    await Linking.openURL(url);
  }, []);

  const onPressPurchase = useCallback(() => {
    if (!isStoreConnected || isEntitlementLoading) {
      return;
    }
    requestAdFreePurchase();
  }, [isEntitlementLoading, isStoreConnected, requestAdFreePurchase]);

  const onPressRestore = useCallback(() => {
    if (!isStoreConnected || isEntitlementLoading) {
      return;
    }
    restorePurchases();
  }, [isEntitlementLoading, isStoreConnected, restorePurchases]);

  const purchaseLabel =
    adFreeProductDisplayPrice != null && adFreeProductDisplayPrice !== ''
      ? `광고 제거 구매 (${adFreeProductDisplayPrice})`
      : '광고 제거 구매';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>광고 제거</Text>
      <View style={styles.card}>
        <Text style={styles.productTitle}>
          {adFreeProductTitle ?? '광고 제거 (일회성)'}
        </Text>
        {lastEntitlementError ? (
          <Text style={styles.errorText}>{lastEntitlementError}</Text>
        ) : null}
        {isAdFree ? (
          <Text style={styles.purchasedHint}>구매가 완료된 상태입니다.</Text>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="광고 제거 상품 구매"
              disabled={!isStoreConnected || isEntitlementLoading}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                (!isStoreConnected || isEntitlementLoading) &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={onPressPurchase}
            >
              {isEntitlementLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonLabel}>{purchaseLabel}</Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="구매 복원"
              disabled={!isStoreConnected || isEntitlementLoading}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.rowPressed,
                (!isStoreConnected || isEntitlementLoading) &&
                  styles.secondaryButtonDisabled,
              ]}
              onPress={onPressRestore}
            >
              <Text style={styles.secondaryButtonLabel}>구매 복원</Text>
            </Pressable>
          </>
        )}
      </View>

      <Text style={[styles.sectionTitle, styles.sectionSpacer]}>앱 정보</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="개인정보 처리방침 열기"
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={openPrivacyPolicy}
      >
        <Text style={styles.rowLabel}>개인정보 처리방침</Text>
        <Text style={styles.rowHint}>Safari에서 보기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  sectionSpacer: {
    marginTop: 28,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  errorText: {
    fontSize: 13,
    color: '#c62828',
  },
  purchasedHint: {
    fontSize: 15,
    color: '#2e7d32',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#111',
    minHeight: 48,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonDisabled: {
    opacity: 0.45,
  },
  secondaryButtonLabel: {
    fontSize: 15,
    color: '#333',
    textDecorationLine: 'underline',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowLabel: {
    fontSize: 16,
    color: '#111',
  },
  rowHint: {
    fontSize: 14,
    color: '#888',
  },
});
