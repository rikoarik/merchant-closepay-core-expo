/**
 * MerchantHeaderCard - Header personalised untuk merchant
 * Menampilkan greeting, nama user, inisial avatar, dan nama perusahaan.
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@core/theme";
import { useAuth } from "@core/auth";
import {
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
} from "@core/config";
import { useTranslation } from "@core/i18n";
import { appConfig } from "../../../../config/app.config";

export const MerchantHeaderCard: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const firstName = user?.name?.split(" ")[0] || "Merchant";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greetingMorning") || "Selamat Pagi";
    if (hour < 18) return t("home.greetingAfternoon") || "Selamat Siang";
    return t("home.greetingEvening") || "Selamat Malam";
  }, [t]);

  const initials = useMemo(() => {
    const parts = (user?.name || "M").split(" ");
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }, [user?.name]);

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.avatarText, { color: colors.surface }]}>
          {initials}
        </Text>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          {greeting}
        </Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {firstName}
        </Text>
        <Text
          style={[styles.company, { color: colors.textTertiary }]}
          numberOfLines={1}
        >
          {appConfig.companyName}
        </Text>
      </View>
    </View>
  );
});

MerchantHeaderCard.displayName = "MerchantHeaderCard";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(14),
    marginBottom: moderateVerticalScale(16),
  },
  avatar: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: getResponsiveFontSize("large"),
    fontFamily: FontFamily.monasans.bold,
  },
  textBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: getResponsiveFontSize("xsmall"),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(1),
  },
  name: {
    fontSize: getResponsiveFontSize("xlarge"),
    fontFamily: FontFamily.monasans.bold,
    lineHeight: scale(28),
  },
  company: {
    fontSize: getResponsiveFontSize("xsmall"),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(1),
  },
});
