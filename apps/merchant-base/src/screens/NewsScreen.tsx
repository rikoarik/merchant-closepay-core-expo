/**
 * NewsScreen — layar "Semua berita" (Berita).
 * Menampilkan daftar berita secara vertikal (bukan horizontal scroll).
 */
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  type ImageSourcePropType,
} from "react-native";
import { useTheme } from "@core/theme";
import { useTranslation } from "@core/i18n";
import {
  ScreenHeader,
  type NewsItem,
  getResponsiveFontSize,
  FontFamily,
  scale,
  moderateVerticalScale,
} from "@core/config";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect fill="#E8E8E8" width="300" height="160"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="12" font-family="sans-serif">Berita</text></svg>',
  );

const MOCK_NEWS_ITEMS = (): NewsItem[] => {
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
};

const formatNewsDate = (date: Date, t: (key: string) => string): string => {
  try {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    // Fallback sederhana jika locale tidak tersedia
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }
};

export const NewsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const items = useMemo(() => MOCK_NEWS_ITEMS(), []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t("home.news") || "Berita"} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Image
              source={{ uri: (item.imageUrl as string) || PLACEHOLDER_IMAGE } as ImageSourcePropType}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.text },
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text
                  style={[
                    styles.cardDescription,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.cardDate,
                  { color: colors.textSecondary },
                ]}
              >
                {formatNewsDate(item.date, t)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(24),
    paddingHorizontal: scale(16),
  },
  card: {
    borderRadius: scale(12),
    borderWidth: 1,
    paddingHorizontal: scale(14),
    paddingVertical: moderateVerticalScale(12),
    marginBottom: moderateVerticalScale(12),
  },
  cardImage: {
    width: "100%",
    height: moderateVerticalScale(120),
    borderRadius: scale(10),
    marginBottom: moderateVerticalScale(10),
    backgroundColor: "#f0f0f0",
  },
  cardContent: {
    gap: scale(4),
  },
  cardTitle: {
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.semiBold,
  },
  cardDescription: {
    fontSize: getResponsiveFontSize("xsmall"),
    fontFamily: FontFamily.monasans.regular,
  },
  cardDate: {
    fontSize: getResponsiveFontSize("xxsmall"),
    fontFamily: FontFamily.monasans.regular,
  },
});
