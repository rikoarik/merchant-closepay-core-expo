/**
 * Full-screen form for Create/Edit FnB menu item (merchant-style, like ProductCreateScreen).
 */

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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Add, Trash } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { fnbMerchantService } from '../../services/fnbMerchantService';
import type { FnBMenuItem, FnBVariant, FnBAddon } from '../../models';

type RouteParams = { item?: FnBMenuItem };

export const FnBMenuFormScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const editItem = (route.params as RouteParams)?.item ?? null;
  const isEdit = !!editItem;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState(true);
  const [variants, setVariants] = useState<FnBVariant[]>([]);
  const [addons, setAddons] = useState<FnBAddon[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPrice(String(editItem.price));
      setCategory(editItem.category ?? '');
      setAvailable(editItem.available);
      setVariants(editItem.variants?.map(v => ({ ...v })) ?? []);
      setAddons(editItem.addons?.map(a => ({ ...a })) ?? []);
    }
  }, [editItem]);

  const addVariant = () => setVariants(prev => [...prev, { id: `v${Date.now()}`, name: '', price: 0 }]);
  const removeVariant = (idx: number) => setVariants(prev => prev.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: 'name' | 'price', value: string | number) => {
    const normalized = field === 'price'
      ? (typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''), 10) || 0)
      : value;
    setVariants(prev => prev.map((v, i) => (i === idx ? { ...v, [field]: normalized } : v)));
  };

  const addAddon = () => setAddons(prev => [...prev, { id: `a${Date.now()}`, name: '', price: 0 }]);
  const removeAddon = (idx: number) => setAddons(prev => prev.filter((_, i) => i !== idx));
  const updateAddon = (idx: number, field: 'name' | 'price', value: string | number) => {
    const normalized = field === 'price'
      ? (typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''), 10) || 0)
      : value;
    setAddons(prev => prev.map((a, i) => (i === idx ? { ...a, [field]: normalized } : a)));
  };

  const handleSave = async () => {
    const priceNum = parseInt(price.replace(/\D/g, ''), 10) || 0;
    if (!name.trim()) {
      Alert.alert('', t('common.required') || 'Nama wajib diisi');
      return;
    }
    if (priceNum <= 0) {
      Alert.alert('', 'Harga harus lebih dari 0');
      return;
    }
    const variantsFiltered = variants.filter(v => v.name.trim()).map((v, i) => ({ ...v, id: v.id || `v${Date.now()}_${i}`, name: v.name.trim(), price: Number(v.price) || 0 }));
    const addonsFiltered = addons.filter(a => a.name.trim()).map((a, i) => ({ ...a, id: a.id || `a${Date.now()}_${i}`, name: a.name.trim(), price: Number(a.price) || 0 }));
    try {
      setSaving(true);
      if (editItem) {
        await fnbMerchantService.updateMenuItem(editItem.id, {
          name: name.trim(),
          price: priceNum,
          category: category.trim() || undefined,
          available,
          variants: variantsFiltered.length ? variantsFiltered : undefined,
          addons: addonsFiltered.length ? addonsFiltered : undefined,
        });
      } else {
        await fnbMerchantService.createMenuItem({
          name: name.trim(),
          price: priceNum,
          category: category.trim() || undefined,
          available,
          variants: variantsFiltered.length ? variantsFiltered : undefined,
          addons: addonsFiltered.length ? addonsFiltered : undefined,
        });
      }
      (navigation as any).goBack();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScreenHeader
        title={isEdit ? (t('common.edit') || 'Edit') + ' Menu' : (t('common.add') || 'Tambah') + ' Menu'}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.form, { paddingHorizontal: getHorizontalPadding() }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('common.basicInfo') || 'Info dasar'}</Text>
          <Text style={[styles.label, { color: colors.text }]}>{t('common.name') || 'Nama'} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder={t('common.name') || 'Nama menu'}
            placeholderTextColor={colors.textSecondary}
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
          <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={category}
            onChangeText={setCategory}
            placeholder="Makanan / Minuman"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Tersedia</Text>
            <Switch value={available} onValueChange={setAvailable} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Variant (ukuran, dll)</Text>
          {variants.map((v, idx) => (
            <View key={v.id || idx} style={[styles.variantRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.inputSmall, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={v.name}
                onChangeText={val => updateVariant(idx, 'name', val)}
                placeholder="S / M / L"
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.inputPrice, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={String(v.price)}
                onChangeText={val => updateVariant(idx, 'price', val)}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => removeVariant(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.addBtn, { borderColor: colors.primary }]} onPress={addVariant}>
            <Add size={18} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Tambah variant</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Addon (topping, dll)</Text>
          {addons.map((a, idx) => (
            <View key={a.id || idx} style={[styles.variantRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.inputSmall, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={a.name}
                onChangeText={val => updateAddon(idx, 'name', val)}
                placeholder="Nama addon"
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.inputPrice, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={String(a.price)}
                onChangeText={val => updateAddon(idx, 'price', val)}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => removeAddon(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.addBtn, { borderColor: colors.primary }]} onPress={addAddon}>
            <Add size={18} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Tambah addon</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={[styles.saveBtnText, { color: colors.surface }]}>{t('common.save') || 'Simpan'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: { paddingTop: 8, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
  inputSmall: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  inputPrice: { width: 88, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderRadius: 10 },
  addBtnText: { fontSize: 14 },
  footer: { marginTop: 8 },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600' },
});
