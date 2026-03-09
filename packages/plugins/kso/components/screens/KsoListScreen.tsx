import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Add, Story } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { ScreenHeader, scale, getHorizontalPadding } from '@core/config';
import { useTranslation } from '@core/i18n';
import { useKsoList } from '../../hooks';
import type { KsoAgreement } from '../../models';

export const KsoListScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { agreements, isLoading, error, refresh } = useKsoList();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = ({ item }: { item: KsoAgreement }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => (navigation as any).navigate('KsoDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.partnerName}</Text>
      {item.partnerCode ? (
        <Text style={[styles.itemCode, { color: colors.textSecondary }]}>{item.partnerCode}</Text>
      ) : null}
      <View style={styles.itemRow}>
        <Text style={[styles.itemStatus, { color: colors.primary }]}>{item.status}</Text>
        {item.revenueSharePercent != null ? (
          <Text style={[styles.itemShare, { color: colors.textSecondary }]}>{item.revenueSharePercent}%</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('merchant.kso') || 'KSO'}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => (navigation as any).navigate('KsoHistory')}
            >
              <Story size={scale(22)} color={colors.primary} variant="Bold" />
              <Text style={[styles.headerBtnLabel, { color: colors.primary }]}>
                {t('kso.history') || 'Riwayat'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => (navigation as any).navigate('KsoCreate')}
            >
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
          data={agreements}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { padding: 4 },
  headerBtnLabel: { fontSize: 12, marginTop: 2 },
  listContent: { paddingBottom: 24 },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemCode: { fontSize: 12, marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  itemStatus: { fontSize: 12, textTransform: 'capitalize' },
  itemShare: { fontSize: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
