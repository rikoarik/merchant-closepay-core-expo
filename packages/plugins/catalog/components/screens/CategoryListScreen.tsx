import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { catalogService } from '../../services/catalogService';
import { useCatalogCategories } from '../../hooks';
import type { Category } from '../../models';

export const CategoryListScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { categories, isLoading, error, refresh } = useCatalogCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('', t('common.required') || 'Nama wajib diisi');
      return;
    }
    try {
      setSaving(true);
      if (editingCategory) {
        await catalogService.updateCategory(editingCategory.id, { name: name.trim() });
      } else {
        await catalogService.createCategory({ name: name.trim() });
      }
      setModalVisible(false);
      refresh();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      t('common.delete') || 'Hapus',
      t('common.confirmDelete') || 'Yakin hapus kategori ini?',
      [
        { text: t('common.cancel') || 'Batal', style: 'cancel' },
        {
          text: t('common.delete') || 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await catalogService.deleteCategory(cat.id);
              refresh();
            } catch (e) {
              Alert.alert('', (e as Error).message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.itemContent} onPress={() => openEdit(item)}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        {item.slug ? <Text style={[styles.itemSlug, { color: colors.textSecondary }]}>{item.slug}</Text> : null}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)}>
        <Text style={{ color: colors.error, fontSize: 14 }}>{t('common.delete') || 'Hapus'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('merchant.products') ? 'Kategori' : 'Kategori'}
        rightComponent={
          <TouchableOpacity onPress={openCreate}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>{t('common.add') || 'Tambah'}</Text>
          </TouchableOpacity>
        }
      />
      {error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{error.message}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={{ color: colors.surface }}>{t('common.retry') || 'Coba lagi'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: getHorizontalPadding() }]}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.center}>
                <Text style={{ color: colors.textSecondary }}>{t('common.empty') || 'Tidak ada data'}</Text>
              </View>
            )
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingCategory ? (t('common.edit') || 'Edit') : (t('common.add') || 'Tambah')} Kategori
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder={t('common.name') || 'Nama kategori'}
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.border }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.text }}>{t('common.cancel') || 'Batal'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={{ color: colors.surface }}>{t('common.save') || 'Simpan'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemContent: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemSlug: { fontSize: 12, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
});
