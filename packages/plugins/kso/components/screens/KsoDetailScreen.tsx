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
import { ksoService } from '../../services/ksoService';
import { useKso } from '../../hooks';

type RouteParams = { id?: string };

export const KsoDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const id = (route.params as RouteParams)?.id ?? null;
  const { kso, isLoading, error, refresh } = useKso(id);

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      t('common.delete') || 'Hapus',
      t('common.confirmDelete') || 'Yakin hapus KSO ini?',
      [
        { text: t('common.cancel') || 'Batal', style: 'cancel' },
        {
          text: t('common.delete') || 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await ksoService.deleteKso(id);
              (navigation as any).goBack();
            } catch (e) {
              Alert.alert('', (e as Error).message);
            }
          },
        },
      ]
    );
  };

  if (!id) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('kso.detail') || 'Detail KSO'} />
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>ID tidak valid</Text>
        </View>
      </View>
    );
  }

  if (isLoading && !kso) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('kso.detail') || 'Detail KSO'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !kso) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('kso.detail') || 'Detail KSO'} />
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error?.message ?? 'KSO tidak ditemukan'}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDate = (d: Date) => (d instanceof Date ? d.toLocaleDateString('id-ID') : String(d));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={kso.partnerName}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => (navigation as any).navigate('KsoEdit', { id: kso.id })}>
              <Text style={{ color: colors.primary, fontSize: 14 }}>{t('common.edit') || 'Edit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 12 }} onPress={handleDelete}>
              <Text style={{ color: colors.error, fontSize: 14 }}>{t('common.delete') || 'Hapus'}</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('kso.partnerName') || 'Nama Partner'}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{kso.partnerName}</Text>
          {kso.partnerCode ? (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('kso.partnerCode') || 'Kode'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{kso.partnerCode}</Text>
            </>
          ) : null}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('kso.status') || 'Status'}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{kso.status}</Text>
          {kso.type ? (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('kso.type') || 'Tipe'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{kso.type}</Text>
            </>
          ) : null}
          {kso.revenueSharePercent != null ? (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('kso.revenueShare') || 'Bagi Hasil %'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{kso.revenueSharePercent}%</Text>
            </>
          ) : null}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('kso.startDate') || 'Mulai'}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{formatDate(kso.startDate)}</Text>
          {kso.endDate ? (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('kso.endDate') || 'Selesai'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{formatDate(kso.endDate)}</Text>
            </>
          ) : null}
          {kso.notes ? (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('common.notes') || 'Catatan'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{kso.notes}</Text>
            </>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          onPress={() => (navigation as any).navigate('KsoTransaction', { ksoId: kso.id })}
        >
          <Text style={[styles.btnText, { color: colors.surface }]}>{t('kso.transaction') || 'Lihat Transaksi'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { flexDirection: 'row' },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 16, marginBottom: 12 },
  btnPrimary: { padding: 16, borderRadius: 8, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
