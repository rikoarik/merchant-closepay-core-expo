/**
 * FnBScreen Component
 * Main entry point for FnB-merchant plugin - Stack Navigator (same pattern as InvoiceScreen)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FnBMenuManageScreen } from './FnBMenuManageScreen';
import { FnBMenuFormScreen } from './FnBMenuFormScreen';
import { FnBOrderInboxScreen } from './FnBOrderInboxScreen';
import { FnBOrderDetailScreen } from './FnBOrderDetailScreen';

const Stack = createNativeStackNavigator();

export const FnBScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="FnBMenuManage"
    >
      <Stack.Screen name="FnBMenuManage" component={FnBMenuManageScreen} />
      <Stack.Screen name="FnBMenuForm" component={FnBMenuFormScreen} />
      <Stack.Screen name="FnBOrderInbox" component={FnBOrderInboxScreen} />
      <Stack.Screen name="FnBOrderDetail" component={FnBOrderDetailScreen} />
    </Stack.Navigator>
  );
};
