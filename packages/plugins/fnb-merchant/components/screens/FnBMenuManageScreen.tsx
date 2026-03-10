/**
 * Daftar menu FnB — merchant back-office style (list only, form di full screen).
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Add, Box1, Edit2, Trash } from 'iconsax-react-nativejs';
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

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const openCreate = () => (navigation as any).navigate('FnBMenuForm');
  const openEdit = (item: FnBMenuItem) => (navigation as any).navigate('FnBMenuForm', { item });

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
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.thumb, { backgroundColor: colors.background }]}>
        <Text style={[styles.thumbText, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <TouchableOpacity style={styles.body} onPress={() => openEdit(item)} activeOpacity={0.7}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>Rp {item.price.toLocaleString('id-ID')}</Text>
        {item.category ? (
          <Text style={[styles.cat, { color: colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
        ) : null}
        {(item.variants?.length || item.addons?.length) ? (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {[item.variants?.length && `${item.variants.length} var`, item.addons?.length && `${item.addons.length} addon`].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </TouchableOpacity>
      <View style={styles.actions}>
        <View style={styles.switchWrap}>
          <Switch
            value={item.available}
            onValueChange={async (v) => {
              try {
                await fnbMerchantService.updateMenuItem(item.id, { available: v });
                refresh();
              } catch (e) {
                Alert.alert('', (e as Error).message);
              }
            }}
          />
        </View>
        <TouchableOpacity onPress={() => openEdit(item)} hitSlop={8} style={styles.iconBtn}>
          <Edit2 size={scale(20)} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8} style={styles.iconBtn}>
          <Trash size={scale(20)} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('merchant.fnbManage') || 'Kelola Menu'}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => (navigation as any).navigate('FnBOrderInbox')}>
              <Box1 size={scale(22)} color={colors.primary} variant="Bold" />
              <Text style={[styles.headerBtnLabel, { color: colors.primary }]}>{t('merchant.orders') || 'Order'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtnHeader, { backgroundColor: colors.primary }]} onPress={openCreate}>
              <Add size={scale(20)} color={colors.surface} variant="Bold" />
              <Text style={[styles.addBtnHeaderLabel, { color: colors.surface }]}>{t('common.add') || 'Tambah'}</Text>
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
          ListHeaderComponent={
            menu.length > 0 ? (
              <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.listHeaderText, { color: colors.textSecondary }]}>
                  {menu.length} item
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
              <View style={styles.center}>
                <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>{t('common.empty') || 'Belum ada menu'}</Text>
                <TouchableOpacity style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]} onPress={openCreate}>
                  <Add size={20} color={colors.surface} />
                  <Text style={[styles.emptyAddBtnText, { color: colors.surface }]}>{t('common.add') || 'Tambah'} Menu</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: { padding: 4, alignItems: 'center' },
  headerBtnLabel: { fontSize: 11, marginTop: 2 },
  addBtnHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnHeaderLabel: { fontSize: 14, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  listHeader: { paddingVertical: 10, borderBottomWidth: 1, marginBottom: 8 },
  listHeaderText: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbText: { fontSize: 18, fontWeight: '700' },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '600' },
  price: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  cat: { fontSize: 12, marginTop: 2 },
  meta: { fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  switchWrap: { transform: [{ scale: 0.85 }] },
  iconBtn: { padding: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  emptyAddBtnText: { fontSize: 15, fontWeight: '600' },
});
