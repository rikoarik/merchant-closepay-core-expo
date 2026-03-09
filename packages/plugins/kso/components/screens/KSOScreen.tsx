/**
 * KSOScreen Component
 * Main entry point for KSO plugin - Stack Navigator (same pattern as InvoiceScreen)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KsoListScreen } from './KsoListScreen';
import { KsoDetailScreen } from './KsoDetailScreen';
import { KsoCreateScreen } from './KsoCreateScreen';
import { KsoEditScreen } from './KsoEditScreen';
import { KsoTransactionScreen } from './KsoTransactionScreen';
import { KsoHistoryScreen } from './KsoHistoryScreen';

const Stack = createNativeStackNavigator();

export const KSOScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="KsoList"
    >
      <Stack.Screen name="KsoList" component={KsoListScreen} />
      <Stack.Screen name="KsoDetail" component={KsoDetailScreen} />
      <Stack.Screen name="KsoCreate" component={KsoCreateScreen} />
      <Stack.Screen name="KsoEdit" component={KsoEditScreen} />
      <Stack.Screen name="KsoTransaction" component={KsoTransactionScreen} />
      <Stack.Screen name="KsoHistory" component={KsoHistoryScreen} />
    </Stack.Navigator>
  );
};
