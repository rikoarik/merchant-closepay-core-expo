import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Platform, Text, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MerchantbaseApp from './apps/merchant-base';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App ErrorBoundary:', error?.message, error?.stack, info.componentStack);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <View style={styles.errorRoot}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText} selectable>
            {this.state.error.message}
          </Text>
          <Text style={styles.errorStack} selectable>
            {this.state.error.stack}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const getWebContentMaxWidth = (width: number) => {
  if (width < 768) return 414;
  if (width < 1024) return 768;
  return 1024;
};

export default function App() {
  const [windowWidth, setWindowWidth] = useState(() =>
    Platform.OS === 'web' ? Dimensions.get('window').width : 414,
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => sub?.remove();
  }, []);

  const content = (
    <AppErrorBoundary>
      <StatusBar style="auto" />
      <MerchantbaseApp />
    </AppErrorBoundary>
  );

  if (Platform.OS === 'web') {
    const contentMaxWidth = getWebContentMaxWidth(windowWidth);
    return (
      <View style={styles.webOuter}>
        <View style={[styles.webInner, { maxWidth: contentMaxWidth }]}>
          <GestureHandlerRootView style={styles.root}>
            {content}
          </GestureHandlerRootView>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      {content}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errorRoot: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  errorTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  errorText: { fontSize: 14, color: '#333', marginBottom: 16 },
  errorStack: { fontSize: 11, color: '#666', fontFamily: 'monospace' },
  webOuter: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webInner: {
    width: '100%',
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
