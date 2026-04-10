import { createContext, PropsWithChildren, useContext } from 'react';
import { useLocalPurchaseEntitlement } from '../hooks/useLocalPurchaseEntitlement';
import type { PurchaseEntitlementValue } from '../purchaseEntitlement/types';

const PurchaseEntitlementContext =
  createContext<PurchaseEntitlementValue | null>(null);

export function PurchaseEntitlementProvider({ children }: PropsWithChildren) {
  const value = useLocalPurchaseEntitlement();

  return (
    <PurchaseEntitlementContext.Provider value={value}>
      {children}
    </PurchaseEntitlementContext.Provider>
  );
}

export function usePurchaseEntitlement(): PurchaseEntitlementValue {
  const context = useContext(PurchaseEntitlementContext);
  if (!context) {
    throw new Error(
      'usePurchaseEntitlement는 PurchaseEntitlementProvider 내부에서 사용해야 합니다.',
    );
  }
  return context;
}
