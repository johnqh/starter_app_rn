/**
 * HistoriesScreen - Display user histories with stats
 *
 * If not logged in, shows sign-in prompt.
 * If logged in, shows histories list with total/percentage stats.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/context/ApiContext';
import { useHistoriesManager } from '@sudobility/starter_lib';
import { useAppColors } from '@/hooks/useAppColors';
import type { HistoriesListScreenProps } from '@/navigation/types';
import type { History } from '@sudobility/starter_types';

export default function HistoriesScreen({ navigation }: HistoriesListScreenProps) {
  const { t } = useTranslation();
  const appColors = useAppColors();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { networkClient, baseUrl, token, userId } = useApi();
  const tabBarHeight = useBottomTabBarHeight();

  const {
    histories,
    total,
    percentage,
    isLoading,
    createHistory,
  } = useHistoriesManager({
    baseUrl,
    networkClient,
    userId,
    token,
  });

  // Add history modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const handleAddHistory = useCallback(async () => {
    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Value', 'Please enter a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createHistory({
        datetime: new Date().toISOString(),
        value,
      });
      setNewValue('');
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create history.');
    } finally {
      setIsSubmitting(false);
    }
  }, [newValue, createHistory]);

  const handleAuthSubmit = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError(t('auth.fillAllFields'));
      return;
    }
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (error: unknown) {
      const authErr = error as { message?: string };
      setAuthError(authErr.message || t('auth.error'));
    } finally {
      setIsAuthSubmitting(false);
    }
  }, [email, password, authMode, signInWithEmail, signUpWithEmail, t]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
    } catch (error: unknown) {
      const authErr = error as { message?: string; code?: string };
      if (authErr.code !== 'SIGN_IN_CANCELLED' && authErr.code !== 'sign_in_cancelled') {
        setAuthError(authErr.message || t('auth.error'));
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  }, [signInWithGoogle, t]);

  const userTotal = histories.reduce((sum, h) => sum + h.value, 0);

  const renderHistoryItem = useCallback(({ item }: { item: History }) => (
    <Pressable
      style={[styles.historyItem, { backgroundColor: appColors.card }]}
      onPress={() => navigation.navigate('HistoryDetail', { historyId: item.id })}
    >
      <View style={styles.historyContent}>
        <Text style={[styles.historyDate, { color: appColors.text }]}>
          {new Date(item.datetime).toLocaleDateString()}
        </Text>
        <Text style={[styles.historyTime, { color: appColors.textMuted }]}>
          {new Date(item.datetime).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={[styles.historyValue, { color: appColors.primary }]}>
        {item.value}
      </Text>
    </Pressable>
  ), [appColors, navigation]);

  // Not logged in - show sign-in prompt
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]} edges={['left', 'right']}>
        <View style={styles.centered}>
          <Text style={[styles.loginPrompt, { color: appColors.textSecondary }]}>
            {t('histories.loginPrompt')}
          </Text>
          <Pressable
            style={[styles.signInButton, { backgroundColor: appColors.primary }]}
            onPress={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
          >
            <Text style={styles.signInButtonText}>{t('auth.signIn')}</Text>
          </Pressable>
        </View>

        {/* Auth Modal */}
        <Modal
          visible={showAuthModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAuthModal(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: appColors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: appColors.border, backgroundColor: appColors.card }]}>
              <Pressable onPress={() => setShowAuthModal(false)}>
                <Text style={[styles.modalCancel, { color: appColors.primary }]}>{t('common.cancel')}</Text>
              </Pressable>
              <Text style={[styles.modalTitle, { color: appColors.text }]}>
                {authMode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
              </Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <View style={styles.modalContent}>
              <Pressable
                style={[styles.googleButton, { backgroundColor: appColors.card, borderColor: appColors.border }, isAuthSubmitting && styles.buttonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={isAuthSubmitting}
              >
                <Text style={[styles.googleButtonText, { color: appColors.textSecondary }]}>
                  {t('auth.continueWithGoogle')}
                </Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: appColors.border }]} />
                <Text style={[styles.dividerText, { color: appColors.textMuted }]}>{t('common.or')}</Text>
                <View style={[styles.dividerLine, { backgroundColor: appColors.border }]} />
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: appColors.card, borderColor: appColors.border, color: appColors.text }]}
                placeholder={t('auth.email')}
                placeholderTextColor={appColors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />

              <TextInput
                style={[styles.input, { backgroundColor: appColors.card, borderColor: appColors.border, color: appColors.text }]}
                placeholder={t('auth.password')}
                placeholderTextColor={appColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              {authError && (
                <Text style={[styles.errorText, { color: appColors.error }]}>{authError}</Text>
              )}

              <Pressable
                style={[styles.submitButton, { backgroundColor: appColors.primary }, isAuthSubmitting && styles.buttonDisabled]}
                onPress={handleAuthSubmit}
                disabled={isAuthSubmitting}
              >
                {isAuthSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {authMode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                style={styles.switchAuthMode}
              >
                <Text style={[styles.switchAuthModeText, { color: appColors.primary }]}>
                  {authMode === 'signin' ? t('auth.noAccount') : t('auth.hasAccount')}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Logged in - show histories
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]} edges={['left', 'right']}>
      {/* Stats Section */}
      <View style={[styles.statsContainer, { backgroundColor: appColors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: appColors.primary }]}>{userTotal.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: appColors.textMuted }]}>{t('histories.yourTotal')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: appColors.primary }]}>{total.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: appColors.textMuted }]}>{t('histories.globalTotal')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: appColors.primary }]}>{percentage.toFixed(1)}%</Text>
          <Text style={[styles.statLabel, { color: appColors.textMuted }]}>{t('histories.percentage')}</Text>
        </View>
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Pressable
          style={[styles.addButton, { backgroundColor: appColors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ {t('histories.add')}</Text>
        </Pressable>
      </View>

      {/* Histories List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      ) : histories.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: appColors.textMuted }]}>
            {t('histories.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={histories}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 16 }]}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        />
      )}

      {/* Add History Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: appColors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: appColors.border, backgroundColor: appColors.card }]}>
            <Pressable onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: appColors.primary }]}>{t('common.cancel')}</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: appColors.text }]}>{t('histories.add')}</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.fieldLabel, { color: appColors.text }]}>{t('histories.value')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: appColors.card, borderColor: appColors.border, color: appColors.text }]}
              placeholder="0.00"
              placeholderTextColor={appColors.textMuted}
              value={newValue}
              onChangeText={setNewValue}
              keyboardType="decimal-pad"
              autoFocus
            />

            <Pressable
              style={[styles.submitButton, { backgroundColor: appColors.primary }, isSubmitting && styles.buttonDisabled]}
              onPress={handleAddHistory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>{t('histories.create')}</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
    padding: 24,
  },
  loginPrompt: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 10,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  listSeparator: {
    height: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  historyTime: {
    fontSize: 13,
    marginTop: 2,
  },
  historyValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: 60,
  },
  modalContent: {
    padding: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  switchAuthMode: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchAuthModeText: {
    fontSize: 14,
  },
  googleButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 14,
    paddingHorizontal: 12,
  },
});
