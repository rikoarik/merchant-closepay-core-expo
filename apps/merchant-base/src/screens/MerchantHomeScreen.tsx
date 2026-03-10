/**
 * Merchant Home Screen — single dashboard, responsive untuk EDC, phone, tablet.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  type TextStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@core/theme";
import { useTranslation } from "@core/i18n";
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
  useConfig,
  type QuickMenuItem,
} from "@core/config";
import { BalanceCard } from "@plugins/balance";
import { TopBar } from "../components/home/layout/TopBar";
import { getMenuIconForQuickAccessMerchant } from "../components/merchant/MerchantQuickMenuIcons";
import { DailySummaryCard } from "../components/home/widgets/DailySummaryCard";
import { RecentActivitySection } from "../components/home/sections/RecentActivitySection";
import { SectionHeader } from "../components/home/sections/SectionHeader";
import { MerchantNewsGridSection } from "../components/home/sections/MerchantNewsGridSection";
import { MerchantAllMenuSheet } from "../components/home/MerchantAllMenuSheet";
import type { NewsItem } from "@core/config";

const MAX_CONTENT_WIDTH = 500;
const GRID_COLUMNS_PHONE = 4;
const GRID_COLUMNS_TABLET = 5;
const QUICK_ICON_BOX_SIZE = 44;
const QUICK_GRID_RIGHT_COLUMNS = 4;

type WebTextStyle = TextStyle & {
  wordBreak?: "normal" | "break-all" | "keep-all";
  overflowWrap?: "normal" | "break-word" | "anywhere";
  hyphens?: "none" | "manual" | "auto";
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const MerchantHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width: screenWidth, isEDC, isTablet } = useDimensions();
  const { config } = useConfig();
  const isTabletOrWeb = screenWidth >= 768;
  const {
    enabledItems,
    isLoading: menuLoading,
    refresh: refreshMenu,
  } = useQuickMenu();
  const { balance, refresh: refreshBalance } = useBalance();
  const [showBalance, setShowBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allMenuVisible, setAllMenuVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshMenu(), refreshBalance()]);
    setRefreshing(false);
  }, [refreshMenu, refreshBalance]);

  useFocusEffect(
    useCallback(() => {
      refreshMenu();
    }, [refreshMenu]),
  );

  const insets = useSafeAreaInsets();
  const primaryColor = colors.primary;
  const horizontalPadding = getHorizontalPadding();
  const verticalPadding = getVerticalPadding();
  const minTouchSize = getMinTouchTarget();
  const extraPaddingPhone = isTabletOrWeb ? 0 : scale(8);
  const contentHorizontalPadding = horizontalPadding + extraPaddingPhone;

  const contentMaxWidth = useMemo(() => {
    const w = screenWidth - contentHorizontalPadding * 2;
    if (Platform.OS === "web" || isTablet) {
      return Math.min(w, MAX_CONTENT_WIDTH);
    }
    return w;
  }, [screenWidth, contentHorizontalPadding, isTablet]);

  const effectiveWidth = contentMaxWidth;

  const gridColumns = isTablet ? GRID_COLUMNS_TABLET : GRID_COLUMNS_PHONE;
  const gap = getTabletGap(scale(10), scale(14), scale(12));
  const quickItemSize = useMemo(() => {
    const totalGap = gap * (gridColumns - 1);
    return Math.floor((effectiveWidth - totalGap) / gridColumns);
  }, [effectiveWidth, gap, gridColumns]);

  const gridRowGap = scale(12);
  const GRID_RIGHT_COLUMNS = 4;
  const quickItemSizeGridRight = useMemo(() => {
    if (!isTabletOrWeb) return quickItemSize;
    const rowWidth = screenWidth - horizontalPadding * 2 - gridRowGap * 2;
    const colWidth = rowWidth / 3;
    const totalGap = gap * (GRID_RIGHT_COLUMNS - 1);
    return Math.floor((colWidth - totalGap) / GRID_RIGHT_COLUMNS);
  }, [isTabletOrWeb, screenWidth, horizontalPadding, gridRowGap, gap, quickItemSize]);

  const menuButtons = useMemo(() => {
    const items = enabledItems.length > 0 ? enabledItems : [];
    return items.map((item) => ({
      id: item.id,
      label: getMenuLabelKey(item) ? t(getMenuLabelKey(item)!) : item.label,
      icon: getMenuIconForQuickAccessMerchant(
        primaryColor,
        item.icon as string,
        item.id,
      ),
      route: (item as QuickMenuItem).route,
    }));
  }, [enabledItems, t, primaryColor]);

  const displayedButtons = useMemo(() => menuButtons.slice(0, 7), [menuButtons]);

  const tabletQuickRows = useMemo(() => {
    const items: Array<{ type: "menu"; btn: (typeof menuButtons)[0] } | { type: "all" }> = [
      ...displayedButtons.map((btn) => ({ type: "menu" as const, btn })),
      { type: "all" as const },
    ];
    return chunk(items, QUICK_GRID_RIGHT_COLUMNS);
  }, [displayedButtons]);

  const latestNewsItems = useMemo<NewsItem[]>(() => {
    const now = new Date();
    return [
      {
        id: "1",
        title: "Tips mengelola toko agar penjualan meningkat",
        description: "Pelajari strategi sederhana untuk mendongkrak omzet toko.",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      },
      {
        id: "2",
        title: "Fitur terbaru: laporan transaksi harian",
        description: "Pantau pemasukan dan transaksi harian dengan lebih mudah.",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      },
      {
        id: "3",
        title: "Cara aman terima pembayaran digital",
        description: "Panduan keamanan untuk transaksi di toko Anda.",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      },
      {
        id: "4",
        title: "Promo merchant: potongan biaya transaksi",
        description: "Manfaatkan periode promo untuk menghemat biaya.",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      },
    ];
  }, []);

  const balanceAmount = balance?.balance ?? 0;
  const balanceTitle = "Saldo Utama";

  const contentContainerStyle = useMemo(
    () => [
      styles.content,
      {
        paddingHorizontal: contentHorizontalPadding,
        paddingBottom: moderateVerticalScale(32) + verticalPadding + insets.bottom,
      },
    ],
    [contentHorizontalPadding, verticalPadding, insets.bottom],
  );

  const contentWrapperStyle = useMemo(
    () => [styles.contentWrapper, { maxWidth: contentMaxWidth }],
    [contentMaxWidth],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <TopBar
        onNotificationPress={() =>
          (navigation as any).navigate("Notifications")
        }
        onMenuPress={() => (navigation as any).navigate("Profile")}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          contentContainerStyle,
          isTabletOrWeb && styles.gridScrollContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[primaryColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isTabletOrWeb ? (
          <View style={styles.tabletContentWrap}>
          <View style={styles.gridRow}>
            {/* Kolom kiri: Welcome + Statistik */}
            <View style={[styles.gridCol, styles.gridColLeft]}>
              <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
                <Text style={styles.welcomeTitle}>
                  {t("home.welcome") || "Selamat datang"}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  {config?.companyName || "Merchant Closepay"}
                </Text>
                <Text style={styles.welcomeDesc}>
                  {t("home.welcomeDesc") || "Nikmati kemudahan dalam mengelola toko Anda."}
                </Text>
              </View>
              <View style={styles.gridCard}>
                <DailySummaryCard />
              </View>
            </View>
            {/* Kolom tengah: Saldo + Aktivitas Terakhir */}
            <View style={[styles.gridCol, styles.gridColCenter]}>
              <View style={styles.gridCard}>
                <BalanceCard
                  title={balanceTitle}
                  balance={balanceAmount}
                  showBalance={showBalance}
                  onToggleBalance={() => setShowBalance((v) => !v)}
                  hideDetailButton
                  themeKey={colors.surface}
                />
              </View>
              <View style={styles.gridCard}>
                <RecentActivitySection />
              </View>
            </View>
            {/* Kolom kanan: Aktivitas Anda (Quick Access) - 2 kolom rapi di tablet/web */}
            <View style={[styles.gridCol, styles.gridColRight]}>
              <View style={[styles.gridCard, styles.gridCardQuick]}>
                <View style={[styles.quickSection, styles.quickSectionTablet]}>
                  <SectionHeader
                    title={t("home.yourActivity") || "Aktivitas Anda"}
                    showDetailLink
                    detailLabel={t("home.manageQuickAccess") || "Atur"}
                    onDetailPress={() => (navigation as any).navigate("QuickMenuSettings")}
                  />
                  <View style={[styles.quickGridTabletCol, { gap: gridRowGap }]}>
                    {menuLoading
                      ? chunk(Array.from({ length: 8 }, (_, i) => i), QUICK_GRID_RIGHT_COLUMNS).map((row, ri) => (
                          <View key={ri} style={styles.quickGridRowTablet}>
                            {row.map((i) => (
                              <View key={i} style={styles.quickGridCellTablet}>
                                <View
                                  style={[
                                    styles.quickItemSkeleton,
                                    {
                                      width: "100%",
                                      maxWidth: quickItemSizeGridRight,
                                      height: quickItemSizeGridRight + scale(32),
                                      borderRadius: scale(12),
                                      backgroundColor: colors.border + "40",
                                    },
                                  ]}
                                />
                              </View>
                            ))}
                          </View>
                        ))
                      : tabletQuickRows.map((row, ri) => (
                          <View key={ri} style={styles.quickGridRowTablet}>
                            {row.map((item, ci) => (
                              <View key={`${ri}-${ci}`} style={styles.quickGridCellTablet}>
                                {item.type === "menu" ? (
                                  <TouchableOpacity
                                    style={[
                                      styles.quickItem,
                                      {
                                        width: "100%",
                                        maxWidth: quickItemSizeGridRight,
                                        paddingVertical: scale(10),
                                        paddingHorizontal: scale(6),
                                        borderRadius: scale(12),
                                        backgroundColor: "transparent",
                                        borderWidth: 0,
                                      },
                                    ]}
                                    onPress={() =>
                                      item.btn.route && (navigation as any).navigate(item.btn.route)
                                    }
                                    activeOpacity={0.7}
                                  >
                                    <View
                                      style={[
                                        styles.quickIconBox,
                                        {
                                          width: QUICK_ICON_BOX_SIZE,
                                          height: QUICK_ICON_BOX_SIZE,
                                          backgroundColor: colors.primaryLight,
                                          borderRadius: scale(10),
                                          marginBottom: scale(6),
                                        },
                                      ]}
                                    >
                                      {item.btn.icon}
                                    </View>
                                    <Text
                                      style={[
                                        styles.quickLabel,
                                  Platform.OS === "web" &&
                                    ({
                                      wordBreak: "keep-all",
                                      overflowWrap: "normal",
                                      hyphens: "none",
                                    } as WebTextStyle),
                                        {
                                          color: colors.text,
                                          fontSize: getResponsiveFontSize("xsmall"),
                                          fontFamily: FontFamily.monasans.medium,
                                        },
                                      ]}
                                      numberOfLines={2}
                                    >
                                      {item.btn.label}
                                    </Text>
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    style={[
                                      styles.quickItem,
                                      {
                                        width: "100%",
                                        maxWidth: quickItemSizeGridRight,
                                        paddingVertical: scale(10),
                                        paddingHorizontal: scale(6),
                                        borderRadius: scale(12),
                                        backgroundColor: "transparent",
                                        borderWidth: 0,
                                      },
                                    ]}
                                    onPress={() => setAllMenuVisible(true)}
                                    activeOpacity={0.7}
                                  >
                                    <View
                                      style={[
                                        styles.quickIconBox,
                                        {
                                          width: QUICK_ICON_BOX_SIZE,
                                          height: QUICK_ICON_BOX_SIZE,
                                          backgroundColor: colors.primaryLight,
                                          borderRadius: scale(10),
                                          marginBottom: scale(6),
                                        },
                                      ]}
                                    >
                                      {getMenuIconForQuickAccessMerchant(colors.primary, undefined, "all")}
                                    </View>
                                    <Text
                                      style={[
                                        styles.quickLabel,
                                        Platform.OS === "web" &&
                                          ({
                                            wordBreak: "keep-all",
                                            overflowWrap: "normal",
                                            hyphens: "none",
                                          } as WebTextStyle),
                                        {
                                          color: colors.text,
                                          fontSize: getResponsiveFontSize("xsmall"),
                                          fontFamily: FontFamily.monasans.medium,
                                        },
                                      ]}
                                      numberOfLines={2}
                                    >
                                      {t("home.seeAll") || "Lihat semua"}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            ))}
                          </View>
                        ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.newsFullWidthRow}>
            <View style={styles.gridCard}>
              <MerchantNewsGridSection
                items={latestNewsItems}
                columns={4}
                onViewAllPress={() => (navigation as any).navigate("News")}
              />
            </View>
          </View>
          </View>
        ) : (
          <View style={contentWrapperStyle}>
            <BalanceCard
              title={balanceTitle}
              balance={balanceAmount}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance((v) => !v)}
              hideDetailButton
              themeKey={colors.surface}
            />
            <DailySummaryCard />
            <View style={styles.quickSection}>
              <SectionHeader
                title={t("home.quickAccess") || "Akses Cepat"}
                showDetailLink
                detailLabel={t("home.manageQuickAccess") || "Atur"}
                onDetailPress={() => (navigation as any).navigate("QuickMenuSettings")}
              />
              <View style={[styles.quickGrid, { gap }]}>
                {menuLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.quickItemSkeleton,
                        {
                          width: quickItemSize,
                          height: quickItemSize + scale(32),
                          borderRadius: scale(12),
                          backgroundColor: colors.border + "40",
                        },
                      ]}
                    />
                  ))
                ) : (
                  <>
                    {displayedButtons.map((btn) => (
                      <TouchableOpacity
                        key={btn.id}
                        style={[
                          styles.quickItem,
                          {
                            width: quickItemSize,
                            paddingVertical: scale(10),
                            paddingHorizontal: scale(6),
                            borderRadius: scale(12),
                            backgroundColor: "transparent",
                            borderWidth: 0,
                          },
                        ]}
                        onPress={() =>
                          btn.route && (navigation as any).navigate(btn.route)
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.quickIconBox,
                            {
                              width: QUICK_ICON_BOX_SIZE,
                              height: QUICK_ICON_BOX_SIZE,
                              backgroundColor: colors.primaryLight,
                              borderRadius: scale(10),
                              marginBottom: scale(6),
                            },
                          ]}
                        >
                          {btn.icon}
                        </View>
                        <Text
                          style={[
                            styles.quickLabel,
                            Platform.OS === "web" &&
                              ({
                                wordBreak: "keep-all",
                                overflowWrap: "normal",
                                hyphens: "none",
                              } as WebTextStyle),
                            {
                              color: colors.text,
                              fontSize: getResponsiveFontSize("xsmall"),
                              fontFamily: FontFamily.monasans.medium,
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {btn.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[
                        styles.quickItem,
                        {
                          width: quickItemSize,
                          paddingVertical: scale(10),
                          paddingHorizontal: scale(6),
                          borderRadius: scale(12),
                          backgroundColor: "transparent",
                          borderWidth: 0,
                        },
                      ]}
                      onPress={() => setAllMenuVisible(true)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.quickIconBox,
                          {
                            width: QUICK_ICON_BOX_SIZE,
                            height: QUICK_ICON_BOX_SIZE,
                            backgroundColor: colors.primaryLight,
                            borderRadius: scale(10),
                            marginBottom: scale(6),
                          },
                        ]}
                      >
                        {getMenuIconForQuickAccessMerchant(colors.primary, undefined, "all")}
                      </View>
                      <Text
                        style={[
                          styles.quickLabel,
                          Platform.OS === "web" &&
                            ({
                              wordBreak: "keep-all",
                              overflowWrap: "normal",
                              hyphens: "none",
                            } as WebTextStyle),
                          {
                            color: colors.text,
                            fontSize: getResponsiveFontSize("xsmall"),
                            fontFamily: FontFamily.monasans.medium,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {t("home.seeAll") || "Lihat semua"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            <MerchantAllMenuSheet
              visible={allMenuVisible}
              onClose={() => setAllMenuVisible(false)}
            />
            <RecentActivitySection />
          </View>
        )}

        <MerchantAllMenuSheet
          visible={allMenuVisible}
          onClose={() => setAllMenuVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const GRID_COL_MIN = 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: "center",
  },
  gridScrollContent: {
    flexDirection: "column",
    alignItems: "stretch",
    flexGrow: 1,
    width: "100%",
  },
  tabletContentWrap: {
    width: "100%",
    flexDirection: "column",
  },
  newsFullWidthRow: {
    width: "100%",
    paddingHorizontal: getHorizontalPadding(),
  },
  gridRow: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    gap: scale(16),
    paddingHorizontal: getHorizontalPadding(),
  },
  gridCol: {
    flex: 1,
    minWidth: GRID_COL_MIN,
  },
  gridColLeft: {
    flex: 0.82,
    maxWidth: 340,
    alignItems: "stretch",
  },
  gridColCenter: {
    alignItems: "stretch",
  },
  gridColRight: {
    flex: 1.1,
    maxWidth: 660,
    alignItems: "stretch",
  },
  gridCard: {
    marginBottom: moderateVerticalScale(16),
    borderRadius: scale(16),
    overflow: "hidden",
  },
  gridCardQuick: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
    alignSelf: "stretch",
    width: "100%",
  },
  quickGridTablet: {
    justifyContent: "flex-start",
    marginTop: moderateVerticalScale(12),
  },
  quickGridTabletCol: {
    width: "100%",
    marginTop: moderateVerticalScale(12),
  },
  quickGridRowTablet: {
    flexDirection: "row",
    width: "100%",
    gap: scale(12),
    marginBottom: 0,
  },
  quickGridCellTablet: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 0,
  },
  welcomeCard: {
    padding: scale(20),
    borderRadius: scale(16),
    marginBottom: moderateVerticalScale(16),
  },
  welcomeTitle: {
    fontSize: getResponsiveFontSize("xlarge"),
    fontFamily: FontFamily.monasans.bold,
    color: "#fff",
    marginBottom: scale(4),
  },
  welcomeSubtitle: {
    fontSize: getResponsiveFontSize("medium"),
    fontFamily: FontFamily.monasans.semiBold,
    color: "rgba(255,255,255,0.9)",
    marginBottom: scale(8),
  },
  welcomeDesc: {
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.regular,
    color: "rgba(255,255,255,0.85)",
  },
  contentWrapper: {
    width: "100%",
    alignSelf: "center",
  },
  quickSection: {
    marginTop: moderateVerticalScale(8),
  },
  quickSectionTablet: {
    marginTop: 0,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "stretch",
    width: "100%",
    justifyContent: "space-between",
    marginTop: moderateVerticalScale(8),
  },
  quickItem: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  quickIconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    textAlign: "center",
    width: "100%",
    flexShrink: 1,
  },
  quickItemSkeleton: {},
});

export default MerchantHomeScreen;
