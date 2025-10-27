'use client';

import * as React from 'react';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { SuspendedShopOverlay } from '@/components/suspended-shop-overlay';
import { Loader2 } from 'lucide-react';
import { ApplyToBecomeManufacturer } from '@/components/apply-to-become-manufacturer';

type ManufacturerData = {
  suspensionDetails?: {
    isSuspended: boolean;
    reason: string;
    prohibitions: string[];
    publicDisclaimer: boolean;
  };
};

export default function SellerCentreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, role } = useUser();
  const firestore = useFirestore();

  const manufacturerDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'manufacturers', user.uid);
  }, [user, firestore]);

  const { data: manufacturer, isLoading: isLoadingManufacturer } =
    useDoc<ManufacturerData>(manufacturerDocRef);

  const isLoading = isUserLoading || isLoadingManufacturer;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying shop status...</p>
      </div>
    );
  }

  const isManufacturer = role === 'manufacturer' || role === 'admin' || role === 'super-admin';
  if (!isManufacturer) {
    return <ApplyToBecomeManufacturer />;
  }

  const isSuspended = manufacturer?.suspensionDetails?.isSuspended === true;
  const isBlockedFromDashboard =
    manufacturer?.suspensionDetails?.prohibitions?.includes(
      'block_dashboard_access'
    );
  const suspensionReason =
    manufacturer?.suspensionDetails?.reason || 'Violation of platform policies.';

  if (isSuspended && isBlockedFromDashboard) {
    return <SuspendedShopOverlay reason={suspensionReason} />;
  }

  return <>{children}</>;
}
