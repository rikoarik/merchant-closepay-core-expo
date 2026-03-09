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
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { useKsoSettlements } from '../../hooks';
import type { KsoSettlement } from '../../models';

type RouteParams = { ksoId?: string };

export const KsoTransactionScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const ksoId = (route.params as RouteParams)?.ksoId ?? null;
  const { settlements, isLoading, error, refresh } = useKsoSettlements(ksoId);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = ({ item }: { item: KsoSettlement }) => (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.itemRow}>
        <Text style={[styles.itemAmount, { color: colors.primary }]}>
          Rp {Math.abs(item.amount).toLocaleString('id-ID')}
        </Text>
        <Text style={[styles.itemStatus, { color: colors.textSecondary }]}>{item.status}</Text>
      </View>
      <Text style={[styles.itemType, { color: colors.text }]}>{item.type}</Text>
      {item.description ? (
        <Text style={[styles.itemDesc, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
      ) : null}
      <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
        {item.periodStart instanceof Date ? item.periodStart.toLocaleDateString('id-ID') : String(item.periodStart)} - {item.periodEnd instanceof Date ? item.periodEnd.toLocaleDateString('id-ID') : String(item.periodEnd)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('kso.transaction') || 'Transaksi KSO'} />
      {error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error.message}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={settlements}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemAmount: { fontSize: 16, fontWeight: '600' },
  itemStatus: { fontSize: 12, textTransform: 'capitalize' },
  itemType: { fontSize: 14 },
  itemDesc: { fontSize: 12, marginTop: 2 },
  itemDate: { fontSize: 12, marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
