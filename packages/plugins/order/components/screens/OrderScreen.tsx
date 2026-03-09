/**
 * OrderScreen Component
 * Main entry point for Order plugin - Stack Navigator (same pattern as InvoiceScreen)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrderListScreen } from './OrderListScreen';
import { OrderDetailScreen } from './OrderDetailScreen';

const Stack = createNativeStackNavigator();

export const OrderScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="OrderList"
    >
      <Stack.Screen name="OrderList" component={OrderListScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
};
