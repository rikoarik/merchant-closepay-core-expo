/**
 * DailySummaryCard - Ringkasan statistik harian merchant
 * Menampilkan jumlah transaksi dan pendapatan hari ini dalam dua kolom.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@core/theme";
import {
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
} from "@core/config";
import { useTranslation } from "@core/i18n";

interface DailySummaryCardProps {
  transactionCount?: number | null;
  totalIncome?: number | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = React.memo(
  ({ transactionCount, totalIncome }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const txDisplay =
      transactionCount != null ? transactionCount.toLocaleString("id-ID") : "—";
    const incomeDisplay =
      totalIncome != null ? formatCurrency(totalIncome) : "—";

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: scale(14),
          },
        ]}
      >
        {/* Top accent bar */}
        <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />

        <View style={styles.row}>
          {/* Transaksi */}
          <View style={styles.col}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("home.transactionsToday") || "Transaksi Hari Ini"}
            </Text>
            <Text
              style={[styles.value, { color: colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {txDisplay}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Pendapatan */}
          <View style={[styles.col, styles.colRight]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("home.incomeToday") || "Pendapatan Hari Ini"}
            </Text>
            <Text
              style={[styles.value, { color: colors.success }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {incomeDisplay}
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

DailySummaryCard.displayName = "DailySummaryCard";

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    marginTop: moderateVerticalScale(12),
    marginBottom: moderateVerticalScale(4),
  },
  accentBar: {
    height: scale(4),
    width: "100%",
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    alignItems: "center",
  },
  col: {
    flex: 1,
  },
  colRight: {
    alignItems: "flex-end",
  },
  divider: {
    width: 1,
    height: scale(40),
    marginHorizontal: scale(12),
  },
  label: {
    fontSize: getResponsiveFontSize("xsmall"),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(4),
  },
  value: {
    fontSize: getResponsiveFontSize("xlarge"),
    fontFamily: FontFamily.monasans.bold,
  },
});
