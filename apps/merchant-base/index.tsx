/**
 * Merchant Base App Entry Point
 * Merchant-only app: dashboard, receive payment, transactions, invoice, withdraw.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar, View, Text, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@core/theme';
import { monaSansFontMap } from './loadFonts';
import { I18nProvider } from '@core/i18n';
import { SecurityProviderWrapper } from './SecurityProviderWrapper';
import { configService, configRefreshService, logger, resolveTenantConfig } from '@core/config';
import { initializePlugins } from '@core/config';
import { bootstrapPlugins } from './bootstrap/plugins';
import { createAppNavigator } from '@core/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@core/account';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { MerchantHomeScreen } from './src/screens/MerchantHomeScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { NewsScreen } from './src/screens/NewsScreen';
import { BalanceScreen } from '@plugins/balance';
import { ProductScreen } from '@plugins/catalog';
import { OrderScreen } from '@plugins/order';
import { FnBScreen } from '@plugins/fnb-merchant';
import { KSOScreen } from '@plugins/kso';
import { appConfig } from './config/app.config';
import { setQuickMenuIconProvider } from '@experience-core';
import { getMenuIconForQuickAccessMerchant } from './src/components/merchant/MerchantQuickMenuIcons';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/CustomToast';

const Stack = createNativeStackNavigator();

function MerchantBaseAppContent(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const [pluginsInitialized, setPluginsInitialized] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  const AppNavigator = useMemo(() => {
    const appScreens = (
      <>
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="ReceivePayment" component={PlaceholderScreen} />
        <Stack.Screen name="Settings" component={ProfileScreen} />
        <Stack.Screen name="Account" component={ProfileScreen} />
        <Stack.Screen name="Balance" component={BalanceScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Order" component={OrderScreen} />
        <Stack.Screen name="FnB" component={FnBScreen} />
        <Stack.Screen name="KSO" component={KSOScreen} />
      </>
    );

    const Navigator = createAppNavigator({
      tenantId: 'merchant-base',
      HomeScreen: MerchantHomeScreen,
      appScreens: appScreens,
    });
    return Navigator;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initializeApp = async () => {
      try {
        configService.setBaseConfig(appConfig);
        const tenantId = appConfig.tenantId ?? appConfig.companyId ?? 'default';
        configService.setTenantOverride(resolveTenantConfig(tenantId));
        if (!cancelled) setConfigLoaded(true);

        setQuickMenuIconProvider(getMenuIconForQuickAccessMerchant);
        bootstrapPlugins();
        await initializePlugins();
        if (!cancelled) setPluginsInitialized(true);
      } catch (error) {
        logger.error('Failed to initialize app', error);
        if (!cancelled) {
          setConfigLoaded(true);
          setPluginsInitialized(true);
        }
      }
    };
    initializeApp();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        configRefreshService.refresh().catch((error) => {
          logger.error('Failed to refresh config on app active', error);
        });
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {!configLoaded || !pluginsInitialized ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Memuat aplikasi...</Text>
        </View>
      ) : (
        <AppNavigator />
      )}
      <Toast config={toastConfig} />
    </>
  );
}

function FontLoader({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [fontsLoaded, fontError] = useFonts(monaSansFontMap);
  const { colors } = useTheme();

  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Memuat font...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

function MerchantBaseApp(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <SecurityProviderWrapper>
            <FontLoader>
              <MerchantBaseAppContent />
            </FontLoader>
          </SecurityProviderWrapper>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default MerchantBaseApp;
