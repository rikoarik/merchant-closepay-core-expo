/**
 * Merchant Home Screen — single dashboard, responsive untuk EDC, phone, tablet.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  useQuickMenu,
  useBalance,
  getHorizontalPadding,
  getVerticalPadding,
  getTabletGap,
  getResponsiveFontSize,
  getMinTouchTarget,
  moderateVerticalScale,
  scale,
  useDimensions,
  getMenuLabelKey,
  FontFamily,
  type QuickMenuItem,
} from '@core/config';
import { BalanceCard } from '@plugins/balance';
import { TopBar } from '../components/home/layout/TopBar';
import { getMenuIconForQuickAccessMerchant } from '../components/merchant/MerchantQuickMenuIcons';

const MAX_CONTENT_WIDTH = 500;
const GRID_COLUMNS_PHONE = 2;
const GRID_COLUMNS_TABLET = 4;

export const MerchantHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width: screenWidth, isEDC, isTablet } = useDimensions();
  const { enabledItems, isLoading: menuLoading, refresh: refreshMenu } = useQuickMenu();
  const { balance, refresh: refreshBalance } = useBalance();
  const [showBalance, setShowBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshMenu(), refreshBalance()]);
    setRefreshing(false);
  }, [refreshMenu, refreshBalance]);

  useFocusEffect(
    useCallback(() => {
      refreshMenu();
    }, [refreshMenu])
  );

  const primaryColor = colors.primary;
  const horizontalPadding = getHorizontalPadding();
  const verticalPadding = getVerticalPadding();
  const minTouchSize = getMinTouchTarget();

  const contentMaxWidth = useMemo(() => {
    const w = screenWidth - horizontalPadding * 2;
    if (Platform.OS === 'web' || isTablet) {
      return Math.min(w, MAX_CONTENT_WIDTH);
    }
    return w;
  }, [screenWidth, horizontalPadding, isTablet]);

  const effectiveWidth = contentMaxWidth;

  const gridColumns = isTablet ? GRID_COLUMNS_TABLET : GRID_COLUMNS_PHONE;
  const gap = getTabletGap(scale(12), scale(16), scale(14));
  const quickItemWidth = useMemo(() => {
    const totalGap = gap * (gridColumns - 1);
    return Math.floor((effectiveWidth - totalGap) / gridColumns);
  }, [effectiveWidth, gap, gridColumns]);

  const menuButtons = useMemo(() => {
    const items = enabledItems.length > 0 ? enabledItems : [];
    return items.map((item) => ({
      id: item.id,
      label: getMenuLabelKey(item) ? t(getMenuLabelKey(item)!) : item.label,
      icon: getMenuIconForQuickAccessMerchant(primaryColor, item.icon as string, item.id),
      route: (item as QuickMenuItem).route,
    }));
  }, [enabledItems, t, primaryColor]);

  const balanceAmount = balance?.balance ?? 0;
  const balanceTitle = 'Saldo Utama';

  const contentContainerStyle = useMemo(
    () => [
      styles.content,
      {
        paddingHorizontal: horizontalPadding,
        paddingBottom: moderateVerticalScale(24) + verticalPadding,
      },
    ],
    [horizontalPadding, verticalPadding]
  );

  const contentWrapperStyle = useMemo(
    () => [
      styles.contentWrapper,
      { maxWidth: contentMaxWidth },
    ],
    [contentMaxWidth]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <TopBar
        onNotificationPress={() => (navigation as any).navigate('Notifications')}
        onMenuPress={() => (navigation as any).navigate('Profile')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={contentWrapperStyle}>
        <BalanceCard
          title={balanceTitle}
          balance={balanceAmount}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance((v) => !v)}
          hideDetailButton
          themeKey={colors.surface}
        />

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              padding: scale(16),
              borderRadius: scale(12),
              marginTop: moderateVerticalScale(16),
            },
          ]}
        >
          <Text
            style={[
              styles.summaryTitle,
              {
                color: colors.textSecondary,
                fontSize: getResponsiveFontSize('small'),
                marginBottom: scale(4),
              },
            ]}
          >
            {t('home.transactionsToday')}
          </Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color: colors.text,
                fontSize: getResponsiveFontSize('large'),
                marginBottom: moderateVerticalScale(12),
              },
            ]}
          >
            —
          </Text>
          <Text
            style={[
              styles.summaryTitle,
              {
                color: colors.textSecondary,
                fontSize: getResponsiveFontSize('small'),
                marginBottom: scale(4),
              },
            ]}
          >
            {t('home.incomeToday')}
          </Text>
          <Text
            style={[
              styles.summaryValue,
              { color: colors.text, fontSize: getResponsiveFontSize('large') },
            ]}
          >
            —
          </Text>
        </View>

        <Text
          style={[
            styles.sectionLabel,
            {
              color: colors.textSecondary,
              fontSize: getResponsiveFontSize('small'),
              marginTop: moderateVerticalScale(24),
              marginBottom: moderateVerticalScale(12),
            },
          ]}
        >
          {t('home.quickAccess')}
        </Text>
        <View style={styles.quickGrid}>
          {menuLoading
            ? null
            : menuButtons.map((btn, index) => {
                const rowIndex = Math.floor(index / gridColumns);
                const colIndex = index % gridColumns;
                const isLastInRow = colIndex === gridColumns - 1;
                const isLastRow =
                  rowIndex === Math.ceil(menuButtons.length / gridColumns) - 1;
                return (
                  <TouchableOpacity
                    key={btn.id}
                    style={[
                      styles.quickItem,
                      {
                        width: quickItemWidth,
                        minHeight: minTouchSize + scale(32),
                        marginRight: isLastInRow ? 0 : gap,
                        marginBottom: isLastRow ? 0 : moderateVerticalScale(12),
                        padding: scale(12),
                        borderRadius: scale(12),
                        backgroundColor: colors.surface,
                      },
                    ]}
                    onPress={() => btn.route && (navigation as any).navigate(btn.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.quickIconWrap, { marginBottom: scale(8) }]}>
                      {btn.icon}
                    </View>
                    <Text
                      style={[
                        styles.quickLabel,
                        {
                          color: colors.text,
                          fontSize: getResponsiveFontSize(isEDC ? 'xsmall' : 'small'),
                          fontFamily: FontFamily.monasans.medium,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  summaryCard: {},
  summaryTitle: {},
  summaryValue: {
    fontWeight: '600',
  },
  sectionLabel: {},
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
  },
  quickItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconWrap: {},
  quickLabel: {
    textAlign: 'center',
  },
});

export default MerchantHomeScreen;
