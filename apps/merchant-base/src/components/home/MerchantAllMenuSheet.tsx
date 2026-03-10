/**
 * Sheet "Lihat semua" — daftar semua item quick access, tap → navigate & close.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  getHorizontalPadding,
  getMenuLabelKey,
  scale,
  FontFamily,
  getResponsiveFontSize,
  type QuickMenuItem,
} from '@core/config';
import { getMenuIconForQuickAccessMerchant } from '../merchant/MerchantQuickMenuIcons';
import { useQuickMenu } from '@core/config';

const GRID_COLUMNS = 5;
const GRID_GAP = scale(12);

interface MerchantAllMenuSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const MerchantAllMenuSheet: React.FC<MerchantAllMenuSheetProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { enabledItems } = useQuickMenu();

  const horizontalPadding = getHorizontalPadding();
  const contentWidth = screenWidth - horizontalPadding * 2;
  const itemSize = Math.floor((contentWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS);

  const handleSelect = (item: QuickMenuItem) => {
    if (item.route) {
      (navigation as any).navigate(item.route);
    }
    onClose();
  };

  const items = enabledItems.filter((i) => (i as QuickMenuItem).route);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('home.quickAccessMenu') || 'Semua Menu'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={[styles.closeText, { color: colors.primary }]}>
                {t('common.close') || 'Tutup'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.grid,
              { paddingHorizontal: horizontalPadding, gap: GRID_GAP },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, { width: itemSize }]}
                onPress={() => handleSelect(item as QuickMenuItem)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      width: 48,
                      height: 48,
                      borderRadius: scale(10),
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                >
                  {getMenuIconForQuickAccessMerchant(
                    colors.primary,
                    item.icon as string,
                    item.id
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: colors.text, fontSize: getResponsiveFontSize('xsmall') },
                  ]}
                  numberOfLines={2}
                >
                  {getMenuLabelKey(item) ? t(getMenuLabelKey(item)!) : item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', fontFamily: FontFamily.monasans.bold },
  closeText: { fontSize: 16, fontFamily: FontFamily.monasans.medium },
  scroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 24 },
  item: { alignItems: 'center' },
  iconBox: { alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  label: { textAlign: 'center', fontFamily: FontFamily.monasans.medium },
});
