import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { orderService } from '../../services/orderService';
import { useOrderDetail } from '../../hooks';
import type { Order } from '../../models/Order';

type RouteParams = { id?: string };

const MARKETPLACE_STATUS_FLOW: Order['status'][] = ['paid', 'packing', 'shipped', 'completed'];

export const OrderDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const id = (route.params as RouteParams)?.id ?? null;
  const { order, isLoading, error, refresh } = useOrderDetail(id);
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [saving, setSaving] = useState(false);

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

  const openShipModal = () => {
    setTrackingNumber(order?.trackingNumber ?? '');
    setCourier(order?.courier ?? '');
    setShipModalVisible(true);
  };

  const handleMarkShipped = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await orderService.updateTracking(id, trackingNumber.trim(), courier.trim() || undefined);
      await orderService.updateOrderStatus(id, 'shipped');
      setShipModalVisible(false);
      refresh();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.orders') || 'Detail Order'} />
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>ID tidak valid</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.orders') || 'Detail Order'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.orders') || 'Detail Order'} />
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error?.message ?? 'Order tidak ditemukan'}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canAccept = order.status === 'pending';
  const canCancel = order.status === 'pending';
  const canMarkPacking = order.status === 'paid';
  const canMarkShipped = order.status === 'packing';
  const canMarkCompleted = order.status === 'shipped';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
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

        {order.shippingAddress && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Alamat pengiriman</Text>
            {order.shippingAddress.recipientName ? <Text style={[styles.value, { color: colors.text }]}>{order.shippingAddress.recipientName}</Text> : null}
            {order.shippingAddress.phone ? <Text style={[styles.meta, { color: colors.textSecondary }]}>{order.shippingAddress.phone}</Text> : null}
            {order.shippingAddress.address ? <Text style={[styles.meta, { color: colors.text }]}>{order.shippingAddress.address}</Text> : null}
            {(order.shippingAddress.city || order.shippingAddress.province) && (
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.postalCode].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
        )}

        {order.trackingNumber && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Resi / Pengiriman</Text>
            {order.courier ? <Text style={[styles.meta, { color: colors.textSecondary }]}>{order.courier}</Text> : null}
            <Text style={[styles.value, { color: colors.text }]}>{order.trackingNumber}</Text>
          </View>
        )}

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
        {canMarkPacking && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => handleStatus('packing')}>
            <Text style={[styles.btnText, { color: colors.surface }]}>Mulai packing</Text>
          </TouchableOpacity>
        )}
        {canMarkShipped && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={openShipModal}>
            <Text style={[styles.btnText, { color: colors.surface }]}>Dikirim (input resi)</Text>
          </TouchableOpacity>
        )}
        {canMarkCompleted && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => handleStatus('completed')}>
            <Text style={[styles.btnText, { color: colors.surface }]}>Selesai</Text>
          </TouchableOpacity>
        )}
        {canCancel && (
          <TouchableOpacity style={[styles.btnOutlined, { borderColor: colors.error }]} onPress={handleCancel}>
            <Text style={[styles.btnOutlinedText, { color: colors.error }]}>{t('order.cancelOrder') || 'Batalkan Order'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={shipModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShipModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Input resi pengiriman</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Kurir</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={courier}
              onChangeText={setCourier}
              placeholder="JNE, J&T, dll"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>No. resi</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={trackingNumber}
              onChangeText={setTrackingNumber}
              placeholder="Nomor resi"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.border, marginRight: 6 }]} onPress={() => setShipModalVisible(false)}>
                <Text style={{ color: colors.text }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary, marginLeft: 6 }]} onPress={handleMarkShipped} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={colors.surface} /> : <Text style={{ color: colors.surface }}>Tandai dikirim</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
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
  meta: { fontSize: 14, marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  modalActions: { flexDirection: 'row', marginTop: 8 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
});
