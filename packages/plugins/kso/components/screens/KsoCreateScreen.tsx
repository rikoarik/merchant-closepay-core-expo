import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { ksoService } from '../../services/ksoService';
import type { KsoAgreementStatus, KsoAgreementType } from '../../models';

const STATUS_OPTIONS: KsoAgreementStatus[] = ['pending', 'active', 'inactive'];
const TYPE_OPTIONS: KsoAgreementType[] = ['revenue_share', 'fee'];

export const KsoCreateScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [partnerName, setPartnerName] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [type, setType] = useState<KsoAgreementType | ''>('revenue_share');
  const [status, setStatus] = useState<KsoAgreementStatus>('pending');
  const [revenueSharePercent, setRevenueSharePercent] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!partnerName.trim()) {
      Alert.alert('', t('common.required') || 'Nama partner wajib diisi');
      return;
    }
    try {
      setSaving(true);
      await ksoService.createKso({
        partnerName: partnerName.trim(),
        partnerCode: partnerCode.trim() || undefined,
        type: type || undefined,
        status,
        revenueSharePercent: revenueSharePercent ? parseInt(revenueSharePercent.replace(/\D/g, ''), 10) : undefined,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        notes: notes.trim() || undefined,
      });
      (navigation as any).goBack();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('kso.create') || 'Tambah KSO'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.form, { paddingHorizontal: getHorizontalPadding() }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.text }]}>{t('kso.partnerName') || 'Nama Partner'} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={partnerName}
          onChangeText={setPartnerName}
          placeholder={t('kso.partnerName') || 'Nama partner'}
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { color: colors.text }]}>{t('kso.partnerCode') || 'Kode Partner'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={partnerCode}
          onChangeText={setPartnerCode}
          placeholder="Kode"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { color: colors.text }]}>{t('kso.type') || 'Tipe'}</Text>
        <View style={styles.row}>
          {TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, type === opt && { backgroundColor: colors.primary }]}
              onPress={() => setType(opt)}
            >
              <Text style={[styles.chipText, { color: type === opt ? colors.surface : colors.text }]}>
                {opt === 'revenue_share' ? (t('kso.revenueShare') || 'Bagi Hasil') : (t('kso.fee') || 'Fee')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: colors.text }]}>{t('kso.status') || 'Status'}</Text>
        <View style={styles.row}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, status === opt && { backgroundColor: colors.primary }]}
              onPress={() => setStatus(opt)}
            >
              <Text style={[styles.chipText, { color: status === opt ? colors.surface : colors.text }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: colors.text }]}>{t('kso.revenueShare') || 'Bagi Hasil %'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={revenueSharePercent}
          onChangeText={(v) => setRevenueSharePercent(v.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        <Text style={[styles.label, { color: colors.text }]}>{t('kso.startDate') || 'Tanggal Mulai'} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { color: colors.text }]}>{t('kso.endDate') || 'Tanggal Selesai'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { color: colors.text }]}>{t('common.notes') || 'Catatan'}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('common.notes') || 'Catatan'}
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={[styles.btnText, { color: colors.surface }]}>{t('common.save') || 'Simpan'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: { paddingBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  textArea: { minHeight: 80 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  chipText: { fontSize: 14 },
  btn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 16, fontWeight: '600' },
});
