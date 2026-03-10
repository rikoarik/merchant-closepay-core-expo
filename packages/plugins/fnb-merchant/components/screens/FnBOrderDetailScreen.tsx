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
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { fnbMerchantService } from '../../services/fnbMerchantService';
import { useFnBOrderDetail } from '../../hooks';
import type { FnBOrder, FnBOrderItem } from '../../models/FnBOrder';

type RouteParams = { id?: string };

const STATUS_FLOW: FnBOrder['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

export const FnBOrderDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const id = (route.params as RouteParams)?.id ?? null;
  const { order, isLoading, error, refresh } = useFnBOrderDetail(id);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const handleStatus = async (status: FnBOrder['status']) => {
    if (!id) return;
    try {
      await fnbMerchantService.updateOrderStatus(id, status);
      refresh();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    }
  };

  const handleCancel = () => {
    if (!id) return;
    Alert.alert(
      t('common.cancel') || 'Batalkan',
      'Yakin batalkan order ini?',
      [
        { text: t('common.no') || 'Tidak', style: 'cancel' },
        { text: t('common.yes') || 'Ya', onPress: () => handleStatus('cancelled') },
      ]
    );
  };

  const openRejectModal = () => {
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      setRejecting(true);
      await fnbMerchantService.rejectOrder(id, rejectReason.trim() || 'Ditolak oleh merchant');
      setRejectModalVisible(false);
      refresh();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setRejecting(false);
    }
  };

  const handleCopyPaymentLink = () => {
    if (!id) return;
    const link = fnbMerchantService.getOrderPaymentLink(id);
    Clipboard.setStringAsync(link).then(() => {
      Alert.alert('', t('common.copied') || 'Link disalin');
    });
  };

  if (!id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.fnbManage') || 'Detail Order FnB'} />
        <View style={styles.center}><Text style={{ color: colors.textSecondary }}>ID tidak valid</Text></View>
      </SafeAreaView>
    );
  }

  if (isLoading && !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.fnbManage') || 'Detail Order FnB'} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.fnbManage') || 'Detail Order FnB'} />
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error?.message ?? 'Order tidak ditemukan'}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const canCancel = order.status !== 'completed' && order.status !== 'cancelled';
  const isPending = order.status === 'pending';
  const paymentLink = id ? fnbMerchantService.getOrderPaymentLink(id) : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScreenHeader title={t('merchant.fnbManage') ? 'Detail Order FnB' : 'Detail Order FnB'} />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>ID</Text>
          <Text style={[styles.value, { color: colors.text }]}>{order.id}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
          <Text style={[styles.value, { color: colors.primary }]}>{order.status}</Text>
          {order.status === 'cancelled' && order.rejectReason ? (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Alasan tolak</Text>
              <Text style={[styles.value, { color: colors.text }]}>{order.rejectReason}</Text>
            </>
          ) : null}
        </View>

        {isPending && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Terima pembayaran</Text>
            <Text style={[styles.linkLabel, { color: colors.textSecondary }]}>Link pembayaran (bagikan ke pelanggan)</Text>
            <Text style={[styles.linkText, { color: colors.text }]} selectable>{paymentLink}</Text>
            <TouchableOpacity style={[styles.linkBtn, { backgroundColor: colors.primary }]} onPress={handleCopyPaymentLink}>
              <Text style={[styles.linkBtnText, { color: colors.surface }]}>Salin link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => handleStatus('confirmed')}>
              <Text style={[styles.btnText, { color: colors.surface }]}>Dibayar di kasir</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('order.items') || 'Item'}</Text>
          {order.items.map((item: FnBOrderItem, i: number) => (
            <View key={i} style={styles.itemBlock}>
              <View style={styles.row}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name} x{item.quantity}</Text>
                <Text style={[styles.itemSubtotal, { color: colors.text }]}>Rp {item.subtotal.toLocaleString('id-ID')}</Text>
              </View>
              {item.variant && (
                <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>Variant: {item.variant.name}{item.variant.price ? ` (+Rp ${item.variant.price.toLocaleString('id-ID')})` : ''}</Text>
              )}
              {item.addons?.length ? (
                <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                  Addon: {item.addons.map(a => `${a.name}${a.price ? ` (+Rp ${a.price.toLocaleString('id-ID')})` : ''}`).join(', ')}
                </Text>
              ) : null}
            </View>
          ))}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t('common.total') || 'Total'}</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>Rp {order.total.toLocaleString('id-ID')}</Text>
          </View>
        </View>
        {isPending && (
          <>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => handleStatus('confirmed')}>
              <Text style={[styles.btnText, { color: colors.surface }]}>Konfirmasi order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOutlined, { borderColor: colors.error }]} onPress={openRejectModal}>
              <Text style={[styles.btnOutlinedText, { color: colors.error }]}>Tolak order</Text>
            </TouchableOpacity>
          </>
        )}
        {nextStatus && !isPending && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => handleStatus(nextStatus)}>
            <Text style={[styles.btnText, { color: colors.surface }]}>Lanjut: {nextStatus}</Text>
          </TouchableOpacity>
        )}
        {canCancel && !isPending && (
          <TouchableOpacity style={[styles.btnOutlined, { borderColor: colors.error }]} onPress={handleCancel}>
            <Text style={[styles.btnOutlinedText, { color: colors.error }]}>{t('order.cancelOrder') || 'Batalkan'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRejectModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Tolak order</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Alasan (opsional)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Contoh: Stok habis"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.border }]} onPress={() => setRejectModalVisible(false)}>
                <Text style={{ color: colors.text }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.error }]} onPress={handleReject} disabled={rejecting}>
                {rejecting ? <ActivityIndicator size="small" color={colors.surface} /> : <Text style={{ color: colors.surface }}>Tolak</Text>}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemBlock: { marginBottom: 8 },
  itemName: { flex: 1 },
  itemSubtotal: { fontWeight: '500' },
  itemMeta: { fontSize: 12, marginLeft: 0, marginTop: 2 },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  totalLabel: { fontWeight: '600' },
  totalValue: { fontWeight: '700', fontSize: 18 },
  btn: { padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnOutlined: { padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  btnOutlinedText: { fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  linkLabel: { fontSize: 12, marginBottom: 4 },
  linkText: { fontSize: 12, marginBottom: 8 },
  linkBtn: { padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  linkBtnText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, minHeight: 80 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
});
