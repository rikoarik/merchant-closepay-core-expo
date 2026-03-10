/**
 * RecentActivitySection - Seksi aktivitas transaksi terakhir
 * Menampilkan header "Aktivitas Terakhir" dan placeholder jika kosong.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@core/theme";
import {
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
  getIconSize,
} from "@core/config";
import { useTranslation } from "@core/i18n";
import { useNavigation } from "@react-navigation/native";
import { ClipboardText } from "iconsax-react-nativejs";

export const RecentActivitySection: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("home.recentActivity") || "Aktivitas Terakhir"}
        </Text>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate("Balance")}
        >
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t("home.seeAll") || "Lihat Semua"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder */}
      <View
        style={[
          styles.emptyCard,
          {
            backgroundColor: colors.surface,
            borderRadius: scale(14),
            borderColor: colors.borderLight,
          },
        ]}
      >
        <ClipboardText
          size={getIconSize("large")}
          color={colors.textTertiary}
          variant="Broken"
        />
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          {t("home.noTransactionsToday") || "Belum ada transaksi hari ini"}
        </Text>
      </View>
    </View>
  );
});

RecentActivitySection.displayName = "RecentActivitySection";

const styles = StyleSheet.create({
  container: {
    marginTop: moderateVerticalScale(24),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateVerticalScale(10),
  },
  title: {
    fontSize: getResponsiveFontSize("large"),
    fontFamily: FontFamily.monasans.bold,
  },
  seeAll: {
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.medium,
  },
  emptyCard: {
    paddingVertical: moderateVerticalScale(32),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: scale(10),
  },
  emptyText: {
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.regular,
    textAlign: "center",
  },
});
