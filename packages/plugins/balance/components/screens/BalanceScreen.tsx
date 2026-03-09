/**
 * BalanceScreen Component
 * Main entry point for Balance plugin - Stack Navigator (same pattern as InvoiceScreen)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransactionHistoryScreen } from './TransactionHistoryScreen';
import { BalanceDetailScreen } from './BalanceDetailScreen';

const Stack = createNativeStackNavigator();

export const BalanceScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="TransactionHistory"
    >
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="BalanceDetail" component={BalanceDetailScreen} />
    </Stack.Navigator>
  );
};
