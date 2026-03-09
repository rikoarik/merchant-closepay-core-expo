/**
 * Merchant quick menu icon provider.
 * Mapping for receive-payment, transactions, invoice, withdraw only.
 */
import React from 'react';
import { DocumentText, Element3, ScanBarcode } from 'iconsax-react-nativejs';
import { getIconSize } from '@core/config';
import { IconWallet, IconTransfer } from '../home/quick-actions/icons';

export function getMenuIconForQuickAccessMerchant(
  iconColor: string,
  iconName?: string,
  itemId?: string
): React.ReactNode {
  const s = getIconSize('large');
  const id = (itemId ?? '').toLowerCase();
  const name = (iconName ?? '').trim();
  const variant = 'Bulk' as const;

  switch (id) {
    case 'receive-payment':
      return <ScanBarcode size={s} color={iconColor} variant={variant} />;
    case 'transactions':
      return <IconWallet width={s} height={s} color={iconColor} />;
    case 'invoice':
      return <DocumentText size={s} color={iconColor} variant={variant} />;
    case 'withdraw':
      return <IconTransfer width={s} height={s} color={iconColor} />;
    case 'kso':
      return <DocumentText size={s} color={iconColor} variant={variant} />;
    default:
      break;
  }

  switch (name) {
    case 'qr':
      return <ScanBarcode size={s} color={iconColor} variant={variant} />;
    case 'wallet':
      return <IconWallet width={s} height={s} color={iconColor} />;
    case 'invoice':
      return <DocumentText size={s} color={iconColor} variant={variant} />;
    case 'withdraw':
      return <IconTransfer width={s} height={s} color={iconColor} />;
    default:
      return <Element3 size={s} color={iconColor} variant={variant} />;
  }
}
