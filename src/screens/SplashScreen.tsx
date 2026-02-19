import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? '#111827' : '#ffffff';
  const textColor = colorScheme === 'dark' ? '#f9fafb' : '#111827';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>Starter App</Text>
      <ActivityIndicator size="large" color="#2563eb" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 16,
  },
});
