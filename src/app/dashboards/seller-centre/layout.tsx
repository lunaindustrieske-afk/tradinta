'use client';

import * as React from 'react';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { SuspendedShopOverlay } from '@/components/suspended-shop-overlay';
import { Loader2 } from 'lucide-react';
import { PermissionDenied } from '@/components/ui/permission-denied';

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
    if (!user || !firestore || role !== 'manufacturer') return null;
    return doc(firestore, 'manufacturers', user.uid);
  }, [user, firestore, role]);

  const { data: manufacturer, isLoading: isLoadingManufacturer } =
    useDoc<ManufacturerData>(manufacturerDocRef);

  const isLoading = isUserLoading || (role === 'manufacturer' && isLoadingManufacturer);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying account status...</p>
      </div>
    );
  }

  // Only apply suspension logic if the user is a manufacturer
  if (role === 'manufacturer') {
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
  }

  // If all checks pass, render the child page.
  return <>{children}</>;
}
