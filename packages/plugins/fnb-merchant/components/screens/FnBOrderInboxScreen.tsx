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
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { useFnBOrders } from '../../hooks';
import type { FnBOrder } from '../../models/FnBOrder';

export const FnBOrderInboxScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { orders, isLoading, error, refresh } = useFnBOrders();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = ({ item }: { item: FnBOrder }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => (navigation as any).navigate('FnBOrderDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.itemRow}>
        <Text style={[styles.itemId, { color: colors.textSecondary }]}>{item.id}</Text>
        <Text style={[styles.itemStatus, { color: colors.primary }]}>{item.status}</Text>
      </View>
      <Text style={[styles.itemTotal, { color: colors.text }]}>Rp {item.total.toLocaleString('id-ID')}</Text>
      {item.customerName ? <Text style={[styles.itemCustomer, { color: colors.textSecondary }]}>{item.customerName}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScreenHeader title={t('merchant.fnbManage') ? 'Order FnB' : 'Order FnB'} />
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
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[colors.primary]} />}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
              <View style={styles.center}><Text style={{ color: colors.textSecondary }}>{t('common.empty') || 'Tidak ada data'}</Text></View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  item: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemId: { fontSize: 12 },
  itemStatus: { fontSize: 12, textTransform: 'capitalize' },
  itemTotal: { fontSize: 16, fontWeight: '600' },
  itemCustomer: { fontSize: 12, marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
