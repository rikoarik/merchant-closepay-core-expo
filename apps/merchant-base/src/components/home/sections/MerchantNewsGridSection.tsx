/**
 * MerchantNewsGridSection — grid berita untuk tablet/web (isi area kosong di kiri).
 * Menampilkan berita terbaru dalam grid 2 kolom + tombol "Lihat semua berita".
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useTheme, type ThemeColors } from "@core/theme";
import { useTranslation } from "@core/i18n";
import {
  scale,
  moderateVerticalScale,
  getResponsiveFontSize,
  FontFamily,
} from "@core/config";
import { SectionHeader } from "./SectionHeader";
import type { NewsItem } from "@core/config";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect fill="#E8E8E8" width="300" height="160"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="12" font-family="sans-serif">Berita</text></svg>'
  );

function formatNewsDate(date: Date, t: (key: string) => string): string {
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  const months = [
    t("common.months.january"), t("common.months.february"), t("common.months.march"),
    t("common.months.april"), t("common.months.may"), t("common.months.june"),
    t("common.months.july"), t("common.months.august"), t("common.months.september"),
    t("common.months.october"), t("common.months.november"), t("common.months.december"),
  ];
  return `${d} ${months[m] || ""} ${y}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export interface MerchantNewsGridSectionProps {
  items: NewsItem[];
  /** Jumlah kolom horizontal (2 atau 4). Default 2. Pakai 4 untuk full-width di tablet/web. */
  columns?: 2 | 4;
  onNewsPress?: (item: NewsItem) => void;
  onViewAllPress?: () => void;
}

export const MerchantNewsGridSection: React.FC<MerchantNewsGridSectionProps> = React.memo(
  ({ items, columns = 2, onNewsPress, onViewAllPress }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    if (!items || items.length === 0) return null;

    const cols = columns === 4 ? 4 : 2;

    return (
      <View style={styles.container}>
        <SectionHeader
          title={t("home.news") || "Berita"}
          showDetailLink
          detailLabel={t("home.viewAllNews") || "Semua berita"}
          onDetailPress={onViewAllPress}
        />
        <View style={styles.grid}>
          {chunk(items, cols).map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((item, ci) => (
                <View key={item.id || `${ri}-${ci}`} style={[styles.gridCell, cols === 4 && styles.gridCell4]}>
                  <NewsGridCard
                    item={item}
                    colors={colors}
                    onPress={onNewsPress}
                    formatDate={(date) => formatNewsDate(date, t)}
                  />
                </View>
              ))}
              {row.length < cols && Array.from({ length: cols - row.length }).map((_, i) => (
                <View key={`empty-${ri}-${i}`} style={[styles.gridCell, cols === 4 && styles.gridCell4]} />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }
);

MerchantNewsGridSection.displayName = "MerchantNewsGridSection";

interface NewsGridCardProps {
  item: NewsItem;
  colors: ThemeColors;
  onPress?: (item: NewsItem) => void;
  formatDate: (date: Date) => string;
}

const NewsGridCard: React.FC<NewsGridCardProps> = React.memo(
  ({ item, colors, onPress, formatDate }) => {
    const [imageError, setImageError] = useState(false);
    const uri = imageError ? PLACEHOLDER_IMAGE : (item.imageUrl || PLACEHOLDER_IMAGE);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onPress?.(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri } as ImageSourcePropType}
          style={styles.cardImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <View style={styles.cardContentWrap}>
          <Text
            style={[styles.cardTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

NewsGridCard.displayName = "NewsGridCard";

const styles = StyleSheet.create({
  container: {
    marginTop: moderateVerticalScale(16),
  },
  grid: {
    gap: scale(12),
  },
  gridRow: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: scale(10),
  },
  gridCell: {
    flex: 1,
    minWidth: 0,
  },
  gridCell4: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: scale(12),
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: moderateVerticalScale(100),
    backgroundColor: "#f0f0f0",
  },
  cardContentWrap: {
    flex: 1,
    minHeight: scale(56),
    padding: scale(10),
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: getResponsiveFontSize("xsmall"),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: scale(4),
    lineHeight: scale(18),
  },
  cardDate: {
    fontSize: getResponsiveFontSize("xxsmall"),
    fontFamily: FontFamily.monasans.regular,
  },
});
