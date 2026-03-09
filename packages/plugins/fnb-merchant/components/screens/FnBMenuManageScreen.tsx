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
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Add, Box1 } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { ScreenHeader, getHorizontalPadding, scale } from '@core/config';
import { useTranslation } from '@core/i18n';
import { fnbMerchantService } from '../../services/fnbMerchantService';
import { useFnBMenu } from '../../hooks';
import type { FnBMenuItem } from '../../models';

export const FnBMenuManageScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { menu, isLoading, error, refresh } = useFnBMenu();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FnBMenuItem | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory('');
    setAvailable(true);
    setModalVisible(true);
  };

  const openEdit = (item: FnBMenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(String(item.price));
    setCategory(item.category ?? '');
    setAvailable(item.available);
    setModalVisible(true);
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
    try {
      setSaving(true);
      if (editingItem) {
        await fnbMerchantService.updateMenuItem(editingItem.id, {
          name: name.trim(),
          price: priceNum,
          category: category.trim() || undefined,
          available,
        });
      } else {
        await fnbMerchantService.createMenuItem({
          name: name.trim(),
          price: priceNum,
          category: category.trim() || undefined,
          available,
        });
      }
      setModalVisible(false);
      refresh();
    } catch (e) {
      Alert.alert('', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: FnBMenuItem) => {
    Alert.alert(
      t('common.delete') || 'Hapus',
      t('common.confirmDelete') || 'Yakin hapus item ini?',
      [
        { text: t('common.cancel') || 'Batal', style: 'cancel' },
        {
          text: t('common.delete') || 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await fnbMerchantService.deleteMenuItem(item.id);
              refresh();
            } catch (e) {
              Alert.alert('', (e as Error).message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: FnBMenuItem }) => (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.itemContent} onPress={() => openEdit(item)}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>Rp {item.price.toLocaleString('id-ID')}</Text>
        {item.category ? <Text style={[styles.itemCat, { color: colors.textSecondary }]}>{item.category}</Text> : null}
      </TouchableOpacity>
      <View style={styles.itemRight}>
        <Switch value={item.available} onValueChange={async (v) => {
          try { await fnbMerchantService.updateMenuItem(item.id, { available: v }); refresh(); } catch (e) { Alert.alert('', (e as Error).message); }
        }} />
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={{ color: colors.error, fontSize: 14 }}>{t('common.delete') || 'Hapus'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('merchant.fnbManage') || 'Kelola FnB'}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => (navigation as any).navigate('FnBOrderInbox')}
            >
              <Box1 size={scale(22)} color={colors.primary} variant="Bold" />
              <Text style={[styles.headerBtnLabel, { color: colors.primary }]}>
                {t('merchant.orders') || 'Order FnB'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openCreate}>
              <Add size={scale(24)} color={colors.primary} variant="Bold" />
            </TouchableOpacity>
          </View>
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
          data={menu}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: getHorizontalPadding() }]}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[colors.primary]} />}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
              <View style={styles.center}><Text style={{ color: colors.textSecondary }}>{t('common.empty') || 'Tidak ada data'}</Text></View>
            )
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingItem ? (t('common.edit') || 'Edit') : (t('common.add') || 'Tambah')} Menu
            </Text>
            <Text style={[styles.label, { color: colors.text }]}>{t('common.name') || 'Nama'} *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder={t('common.name') || 'Nama'}
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.label, { color: colors.text }]}>Harga *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={price}
              onChangeText={(v) => setPrice(v.replace(/\D/g, ''))}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={category}
              onChangeText={setCategory}
              placeholder="Makanan / Minuman"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Tersedia</Text>
              <Switch value={available} onValueChange={setAvailable} />
            </View>
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { padding: 4, alignItems: 'center' },
  headerBtnLabel: { fontSize: 12, marginTop: 2 },
  listContent: { paddingBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  itemContent: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { fontSize: 14, marginTop: 2 },
  itemCat: { fontSize: 12, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
});
