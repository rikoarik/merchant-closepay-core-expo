import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { catalogService } from '../../services/catalogService';
import { useStore } from '../../hooks';
import type { Store, OperatingHoursDay } from '../../models';

const DAY_LABELS: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const StoreProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { store, isLoading, error, refresh } = useStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [operatingHours, setOperatingHours] = useState<Store['operatingHours']>({});
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [minOrderFreeDelivery, setMinOrderFreeDelivery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setName(store.name);
      setAddress(store.address ?? '');
      setDescription(store.description ?? '');
      setOperatingHours(store.operatingHours ?? {});
      setDeliveryEnabled(store.delivery?.enabled ?? false);
      setRadiusKm(String(store.delivery?.radiusKm ?? 5));
      setDeliveryFee(String(store.delivery?.deliveryFee ?? 0));
      setMinOrderFreeDelivery(String(store.delivery?.minOrderFreeDelivery ?? 0));
    }
  }, [store]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('', t('common.required') || 'Nama toko wajib diisi');
      return;
    }
    try {
      setSaving(true);
      await catalogService.updateStore({
        name: name.trim(),
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        operatingHours: Object.keys(operatingHours).length ? operatingHours : undefined,
        delivery: {
          enabled: deliveryEnabled,
          radiusKm: deliveryEnabled ? parseInt(radiusKm.replace(/\D/g, ''), 10) || 0 : undefined,
          deliveryFee: deliveryEnabled ? parseInt(deliveryFee.replace(/\D/g, ''), 10) || 0 : undefined,
          minOrderFreeDelivery: deliveryEnabled ? parseInt(minOrderFreeDelivery.replace(/\D/g, ''), 10) || 0 : undefined,
        },
      });
      refresh();
      Alert.alert('', t('common.saved') || 'Tersimpan');
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (day: (typeof DAY_KEYS)[number], value: Partial<OperatingHoursDay>) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { open: '08:00', close: '22:00', closed: false, ...prev?.[day], ...value },
    }));
  };

  if (isLoading && !store) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('merchant.storeProfile') || 'Profil Toko'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error && !store) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('merchant.storeProfile') || 'Profil Toko'} />
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error.message}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('merchant.storeProfile') || 'Profil Toko'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profil Toko</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Nama</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Nama toko"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Alamat</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={address}
            onChangeText={setAddress}
            placeholder="Alamat"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Deskripsi</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Deskripsi toko"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Jam Operasional</Text>
          {DAY_KEYS.map(day => {
            const dayHours = operatingHours[day] ?? { open: '08:00', close: '22:00', closed: false };
            return (
              <View key={day} style={[styles.dayRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.dayLabel, { color: colors.text }]}>{DAY_LABELS[day]}</Text>
                <View style={styles.dayControls}>
                  <Switch
                    value={!dayHours.closed}
                    onValueChange={v => updateDay(day, { closed: !v })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                  {!dayHours.closed && (
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                      {dayHours.open} - {dayHours.close}
                    </Text>
                  )}
                  {dayHours.closed && <Text style={[styles.closedText, { color: colors.textSecondary }]}>Tutup</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pengaturan Delivery</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>Aktifkan delivery</Text>
            <Switch
              value={deliveryEnabled}
              onValueChange={setDeliveryEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
          {deliveryEnabled && (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Radius (km)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={radiusKm}
                onChangeText={setRadiusKm}
                placeholder="5"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>Ongkir (Rp)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={deliveryFee}
                onChangeText={setDeliveryFee}
                placeholder="10000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>Min. order gratis ongkir (Rp)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={minOrderFreeDelivery}
                onChangeText={setMinOrderFreeDelivery}
                placeholder="50000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Text style={[styles.saveBtnText, { color: colors.surface }]}>{t('common.save') || 'Simpan'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingVertical: 16, paddingBottom: 32 },
  section: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 12 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  dayLabel: { fontSize: 14 },
  dayControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { fontSize: 12 },
  closedText: { fontSize: 12, fontStyle: 'italic' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  saveBtn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
