/**
 * Merchant quick menu icon provider.
 * Semua item quickAccessMenu punya icon yang sesuai.
 */
import React from 'react';
import { DocumentText, Element3, ScanBarcode, Shop, Box1 } from 'iconsax-react-nativejs';
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
    case 'products':
      return <Shop size={s} color={iconColor} variant={variant} />;
    case 'orders':
      return <Box1 size={s} color={iconColor} variant={variant} />;
    case 'fnb-manage':
      return <Box1 size={s} color={iconColor} variant={variant} />;
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
    case 'products':
      return <Shop size={s} color={iconColor} variant={variant} />;
    case 'orders':
    case 'fnb':
      return <Box1 size={s} color={iconColor} variant={variant} />;
    case 'document':
      return <DocumentText size={s} color={iconColor} variant={variant} />;
    default:
      return <Element3 size={s} color={iconColor} variant={variant} />;
  }
}
