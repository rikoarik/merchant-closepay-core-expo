import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Add, Category2 } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { ScreenHeader, scale, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { useCatalogProducts } from '../../hooks';
import type { Product } from '../../models';

export const ProductListScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { products, isLoading, error, refresh } = useCatalogProducts();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => (navigation as any).navigate('ProductEdit', { id: item.id })}
      activeOpacity={0.7}
    >
      <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
      <Text style={[styles.itemPrice, { color: colors.primary }]}>
        Rp {item.price.toLocaleString('id-ID')}
      </Text>
      {item.sku ? (
        <Text style={[styles.itemSku, { color: colors.textSecondary }]}>{item.sku}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('merchant.products') || 'Produk'}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => (navigation as any).navigate('CategoryList')}
            >
              <Category2 size={scale(22)} color={colors.primary} variant="Bold" />
              <Text style={[styles.headerBtnLabel, { color: colors.primary }]}>
                {t('merchant.categories') || 'Kategori'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => (navigation as any).navigate('ProductCreate')}
            >
              <Add size={scale(24)} color={colors.primary} variant="Bold" />
            </TouchableOpacity>
          </View>
        }
      />
      {error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error.message}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: getHorizontalPadding() }]}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.center}>
                <Text style={{ color: colors.textSecondary }}>{t('common.empty') || 'Tidak ada data'}</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { padding: 4 },
  headerBtnLabel: { fontSize: 12, marginTop: 2 },
  listContent: { paddingBottom: 24 },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { fontSize: 14, marginTop: 4 },
  itemSku: { fontSize: 12, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
