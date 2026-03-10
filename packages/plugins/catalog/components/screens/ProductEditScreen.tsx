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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { catalogService } from '../../services/catalogService';
import { useProduct } from '../../hooks';

type RouteParams = { id?: string };

export const ProductEditScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const id = (route.params as RouteParams)?.id ?? null;
  const { product, isLoading, error, refresh } = useProduct(id);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku ?? '');
      setDescription(product.description ?? '');
      setPrice(String(product.price));
      setStock(String(product.stock ?? 0));
    }
  }, [product]);

  const handleSave = async () => {
    if (!id) return;
    const priceNum = parseInt(price.replace(/\D/g, ''), 10) || 0;
    if (!name.trim()) {
      Alert.alert('', t('common.required') || 'Nama wajib diisi');
      return;
    }
    if (priceNum <= 0) {
      Alert.alert('', 'Harga harus lebih dari 0');
      return;
    }
    try {
      setSaving(true);
      await catalogService.updateProduct(id, {
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        price: priceNum,
        stock: parseInt(stock.replace(/\D/g, ''), 10) || 0,
      });
      (navigation as any).goBack();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      t('common.delete') || 'Hapus',
      t('common.confirmDelete') || 'Yakin hapus produk ini?',
      [
        { text: t('common.cancel') || 'Batal', style: 'cancel' },
        {
          text: t('common.delete') || 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await catalogService.deleteProduct(id);
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.products') || 'Edit Produk'} />
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>ID tidak valid</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.products') || 'Edit Produk'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScreenHeader title={t('merchant.products') || 'Edit Produk'} />
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error?.message ?? 'Produk tidak ditemukan'}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScreenHeader title={t('merchant.products') ? 'Edit Produk' : 'Edit Produk'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.form, { paddingHorizontal: getHorizontalPadding() }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.text }]}>{t('common.name') || 'Nama'} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={name}
          onChangeText={setName}
          placeholder={t('common.name') || 'Nama produk'}
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { color: colors.text }]}>SKU</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={sku}
          onChangeText={setSku}
          placeholder="SKU"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { color: colors.text }]}>{t('common.description') || 'Deskripsi'}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder={t('common.description') || 'Deskripsi'}
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <Text style={[styles.label, { color: colors.text }]}>Harga *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={price}
          onChangeText={(v) => setPrice(v.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        <Text style={[styles.label, { color: colors.text }]}>Stok</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={stock}
          onChangeText={(v) => setStock(v.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={[styles.btnText, { color: colors.surface }]}>{t('common.save') || 'Simpan'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnDelete, { borderColor: colors.error }]}
          onPress={handleDelete}
          disabled={saving}
        >
          <Text style={[styles.btnDeleteText, { color: colors.error }]}>{t('common.delete') || 'Hapus'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: { paddingVertical: 16, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  textArea: { minHeight: 80 },
  btn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnDelete: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12, borderWidth: 1 },
  btnDeleteText: { fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
