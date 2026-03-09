/**
 * ProductScreen Component
 * Main entry point for Catalog plugin - Stack Navigator (same pattern as InvoiceScreen)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from './ProductListScreen';
import { ProductCreateScreen } from './ProductCreateScreen';
import { ProductEditScreen } from './ProductEditScreen';
import { CategoryListScreen } from './CategoryListScreen';

const Stack = createNativeStackNavigator();

export const ProductScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="ProductList"
    >
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductCreate" component={ProductCreateScreen} />
      <Stack.Screen name="ProductEdit" component={ProductEditScreen} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
    </Stack.Navigator>
  );
};
