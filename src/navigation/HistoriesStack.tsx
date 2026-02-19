import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HistoriesStackParamList } from './types';
import HistoriesScreen from '@/screens/HistoriesScreen';
import HistoryDetailScreen from '@/screens/HistoryDetailScreen';

const Stack = createNativeStackNavigator<HistoriesStackParamList>();

export function HistoriesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="HistoriesList"
        component={HistoriesScreen}
        options={{ title: 'Histories' }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: 'History Detail' }}
      />
    </Stack.Navigator>
  );
}
