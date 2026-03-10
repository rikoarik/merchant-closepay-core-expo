import React, { useState, useCallback } from 'react';
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
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { useOrders } from '../../hooks';
import type { Order } from '../../models/Order';

const STATUS_OPTIONS: { value: Order['status'] | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'pending', labelKey: 'order.statusPending' },
  { value: 'paid', labelKey: 'order.statusPaid' },
  { value: 'cancelled', labelKey: 'order.statusCancelled' },
  { value: 'refunded', labelKey: 'order.statusRefunded' },
];

export const OrderListScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const filters = statusFilter === 'all' ? undefined : { status: statusFilter };
  const { orders, isLoading, error, refresh } = useOrders(filters);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => (navigation as any).navigate('OrderDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.itemRow}>
        <Text style={[styles.itemId, { color: colors.textSecondary }]}>{item.id}</Text>
        <Text style={[styles.itemStatus, { color: colors.primary }]}>{item.status}</Text>
      </View>
      <Text style={[styles.itemTotal, { color: colors.text }]}>
        Rp {item.total.toLocaleString('id-ID')}
      </Text>
      <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
        {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString('id-ID') : String(item.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScreenHeader title={t('merchant.orders') || 'Order'} />
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.tab, statusFilter === opt.value && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setStatusFilter(opt.value)}
          >
            <Text style={[styles.tabText, { color: statusFilter === opt.value ? colors.primary : colors.textSecondary }]}>
              {t(opt.labelKey) || opt.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error.message}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
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
  tabs: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: { paddingVertical: 12, paddingHorizontal: 8 },
  tabText: { fontSize: 14 },
  listContent: { paddingBottom: 24 },
  item: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemId: { fontSize: 12 },
  itemStatus: { fontSize: 12, textTransform: 'capitalize' },
  itemTotal: { fontSize: 16, fontWeight: '600' },
  itemDate: { fontSize: 12, marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
