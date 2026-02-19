/**
 * HistoryDetailScreen - Display a single history entry
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/context/ApiContext';
import { useHistoriesManager } from '@sudobility/starter_lib';
import { useAppColors } from '@/hooks/useAppColors';
import type { HistoryDetailScreenProps } from '@/navigation/types';

export default function HistoryDetailScreen({ route, navigation }: HistoryDetailScreenProps) {
  const { historyId } = route.params;
  const { t } = useTranslation();
  const appColors = useAppColors();
  const { networkClient, baseUrl, token, userId } = useApi();

  const {
    histories,
    isLoading,
    deleteHistory,
  } = useHistoriesManager({
    baseUrl,
    networkClient,
    userId,
    token,
  });

  const history = histories.find(h => h.id === historyId);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('common.delete'),
      t('histories.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHistory(historyId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete history.');
            }
          },
        },
      ]
    );
  }, [historyId, deleteHistory, navigation, t]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]} edges={['left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!history) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]} edges={['left', 'right']}>
        <View style={styles.centered}>
          <Text style={[styles.notFoundText, { color: appColors.textMuted }]}>
            {t('histories.notFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]} edges={['left', 'right']}>
      <View style={styles.content}>
        {/* Detail Card */}
        <View style={[styles.card, { backgroundColor: appColors.card }]}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: appColors.textMuted }]}>
              {t('histories.datetime')}
            </Text>
            <Text style={[styles.fieldValue, { color: appColors.text }]}>
              {new Date(history.datetime).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.separator, { backgroundColor: appColors.border }]} />

          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: appColors.textMuted }]}>
              {t('histories.value')}
            </Text>
            <Text style={[styles.fieldValueLarge, { color: appColors.primary }]}>
              {history.value}
            </Text>
          </View>

          {history.created_at && (
            <>
              <View style={[styles.separator, { backgroundColor: appColors.border }]} />
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: appColors.textMuted }]}>
                  {t('histories.createdAt')}
                </Text>
                <Text style={[styles.fieldValue, { color: appColors.text }]}>
                  {new Date(history.created_at).toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Delete Button */}
        <Pressable
          style={[styles.deleteButton, { backgroundColor: appColors.error }]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 24,
  },
  fieldRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
  },
  fieldValueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
