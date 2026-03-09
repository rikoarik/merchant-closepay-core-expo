import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { orderService } from '../../services/orderService';
import { useOrderDetail } from '../../hooks';
import type { Order } from '../../models/Order';

type RouteParams = { id?: string };

export const OrderDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const id = (route.params as RouteParams)?.id ?? null;
  const { order, isLoading, error, refresh } = useOrderDetail(id);

  const handleStatus = async (status: Order['status']) => {
    if (!id) return;
    try {
      await orderService.updateOrderStatus(id, status);
      refresh();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    }
  };

  const handleCancel = () => {
    if (!id) return;
    Alert.alert(
      t('common.cancel') || 'Batalkan',
      t('order.confirmCancel') || 'Yakin batalkan order ini?',
      [
        { text: t('common.no') || 'Tidak', style: 'cancel' },
        { text: t('common.yes') || 'Ya', onPress: () => handleStatus('cancelled') },
      ]
    );
  };

  if (!id) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('merchant.orders') || 'Detail Order'} />
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>ID tidak valid</Text>
        </View>
      </View>
    );
  }

  if (isLoading && !order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('merchant.orders') || 'Detail Order'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('merchant.orders') || 'Detail Order'} />
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error?.message ?? 'Order tidak ditemukan'}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const canAccept = order.status === 'pending';
  const canCancel = order.status === 'pending';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('merchant.orders') ? 'Detail Order' : 'Detail Order'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>ID Order</Text>
          <Text style={[styles.value, { color: colors.text }]}>{order.id}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
          <Text style={[styles.value, { color: colors.primary }]}>{order.status}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('order.items') || 'Item'}</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {item.productName} x{item.quantity}
              </Text>
              <Text style={[styles.itemSubtotal, { color: colors.text }]}>
                Rp {item.subtotal.toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t('common.total') || 'Total'}</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              Rp {order.total.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
        {canAccept && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => handleStatus('paid')}
          >
            <Text style={[styles.btnText, { color: colors.surface }]}>{t('order.markPaid') || 'Tandai Lunas'}</Text>
          </TouchableOpacity>
        )}
        {canCancel && (
          <TouchableOpacity style={[styles.btnOutlined, { borderColor: colors.error }]} onPress={handleCancel}>
            <Text style={[styles.btnOutlinedText, { color: colors.error }]}>{t('order.cancelOrder') || 'Batalkan Order'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingVertical: 16, paddingBottom: 32 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 12, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { flex: 1 },
  itemSubtotal: { fontWeight: '500' },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  totalLabel: { fontWeight: '600' },
  totalValue: { fontWeight: '700', fontSize: 18 },
  btn: { padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnOutlined: { padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  btnOutlinedText: { fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
