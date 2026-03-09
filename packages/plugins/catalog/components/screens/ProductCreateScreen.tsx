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
import { catalogService } from '../../services/catalogService';
import { useCatalogCategories } from '../../hooks';

export const ProductCreateScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { categories } = useCatalogCategories();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const priceNum = parseInt(price.replace(/\D/g, ''), 10) || 0;
    if (!name.trim()) {
      Alert.alert('', t('common.required') || 'Nama wajib diisi');
      return;
    }
    if (priceNum <= 0) {
      Alert.alert('', t('merchant.products') ? 'Harga harus lebih dari 0' : 'Harga harus lebih dari 0');
      return;
    }
    try {
      setSaving(true);
      await catalogService.createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        price: priceNum,
        categoryId: categoryId || undefined,
        stock: parseInt(stock.replace(/\D/g, ''), 10) || 0,
        isActive: true,
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
      <ScreenHeader title={t('merchant.products') ? 'Tambah Produk' : 'Tambah Produk'} />
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
      </ScrollView>
    </View>
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
});
