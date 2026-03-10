import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { catalogService } from '@plugins/catalog';

const STORE_QR_PREFIX = 'closepay://fnb/';

export const FnBQRScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [storeId, setStoreId] = useState<string>('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    catalogService.getStore().then(store => {
      if (!cancelled && store) setStoreId(store.id);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const storeLink = storeId ? `${STORE_QR_PREFIX}${storeId}` : '';
  const tableLink = storeId && tableNumber.trim()
    ? `${STORE_QR_PREFIX}${storeId}/table/${tableNumber.trim()}`
    : '';

  const copyStoreLink = () => {
    if (!storeLink) return;
    Clipboard.setStringAsync(storeLink).then(() => {
      // optional: toast
    });
  };

  const copyTableLink = () => {
    if (!tableLink) return;
    Clipboard.setStringAsync(tableLink).then(() => {});
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="QR Toko / Meja" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('merchant.fnbQR') || 'QR Toko / Meja'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>QR Toko</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Pelanggan scan atau buka link untuk order di toko ini.
          </Text>
          {storeLink ? (
            <>
              <Text style={[styles.linkText, { color: colors.text }]} selectable>{storeLink}</Text>
              <TouchableOpacity style={[styles.copyBtn, { backgroundColor: colors.primary }]} onPress={copyStoreLink}>
                <Text style={[styles.copyBtnText, { color: colors.surface }]}>Salin link toko</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Profil toko belum diisi. Atur di Katalog → Profil Toko.</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>QR Meja</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Link per meja (dine-in). Masukkan nomor meja.
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={tableNumber}
            onChangeText={setTableNumber}
            placeholder="Nomor meja (1, 2, A1, ...)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="default"
          />
          {tableLink ? (
            <>
              <Text style={[styles.linkText, { color: colors.text }]} selectable>{tableLink}</Text>
              <TouchableOpacity style={[styles.copyBtn, { backgroundColor: colors.primary }]} onPress={copyTableLink}>
                <Text style={[styles.copyBtnText, { color: colors.surface }]}>Salin link meja</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingVertical: 16, paddingBottom: 32 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  hint: { fontSize: 12, marginBottom: 12 },
  linkText: { fontSize: 12, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  copyBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
  copyBtnText: { fontSize: 14, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
});
