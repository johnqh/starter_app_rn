/**
 * SettingsScreen - App settings and preferences
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useSettingsStore, type ThemeMode } from '@/stores/settingsStore';
import { useAppColors } from '@/hooks/useAppColors';
import type { SettingsScreenProps } from '@/navigation/types';

// Theme options
const themes: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen(_props: SettingsScreenProps) {
  const { t } = useTranslation();
  const appColors = useAppColors();
  const { user, isLoading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { theme, setTheme } = useSettingsStore();

  const tabBarHeight = useBottomTabBarHeight();

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle theme change
  const handleThemeChange = useCallback(() => {
    const currentIndex = themes.findIndex(th => th.value === theme);

    Alert.alert(
      t('settings.selectTheme'),
      undefined,
      [
        ...themes.map((th, index) => ({
          text: `${t(`settings.theme.${th.value}`, th.label)}${index === currentIndex ? ' \u2713' : ''}`,
          onPress: () => setTheme(th.value),
        })),
        { text: t('common.cancel'), style: 'cancel' as const },
      ]
    );
  }, [theme, setTheme, t]);

  // Handle auth submit
  const handleAuthSubmit = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError(t('auth.fillAllFields'));
      return;
    }

    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  }, [email, password, authMode, signInWithEmail, signUpWithEmail, t]);

  // Handle Google sign in
  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  }, [signInWithGoogle, t]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    Alert.alert(
      t('auth.signOut'),
      t('auth.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  }, [signOut, t]);

  const currentTheme = themes.find(th => th.value === theme)?.label ?? 'System';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 16 }]}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.textMuted }]}>
            {t('settings.appearance')}
          </Text>
          <View style={[styles.group, { backgroundColor: appColors.card }]}>
            <Pressable style={styles.settingRow} onPress={handleThemeChange}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: appColors.text }]}>
                  {t('settings.theme.label')}
                </Text>
                <Text style={[styles.settingDescription, { color: appColors.textMuted }]}>
                  {t('settings.themeDescription')}
                </Text>
              </View>
              <Text style={[styles.settingValue, { color: appColors.textMuted }]}>
                {t(`settings.theme.${theme}`, currentTheme)}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.textMuted }]}>
            {t('settings.account')}
          </Text>
          <View style={[styles.group, { backgroundColor: appColors.card }]}>
            {authLoading ? (
              <View style={styles.settingRow}>
                <ActivityIndicator size="small" color={appColors.primary} />
              </View>
            ) : user ? (
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: appColors.text }]}>
                    {user.email || t('auth.signedIn')}
                  </Text>
                  <Text style={[styles.settingDescription, { color: appColors.textMuted }]}>
                    {user.displayName || user.uid.substring(0, 8)}
                  </Text>
                </View>
                <Pressable onPress={handleSignOut}>
                  <Text style={[styles.signOutText, { color: appColors.primary }]}>
                    {t('auth.signOut')}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.settingRow}
                onPress={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                }}
              >
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: appColors.text }]}>
                    {t('auth.signIn')}
                  </Text>
                  <Text style={[styles.settingDescription, { color: appColors.textMuted }]}>
                    {t('settings.signInDescription')}
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: appColors.textMuted }]}>{'\u203A'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.textMuted }]}>
            {t('settings.about')}
          </Text>
          <Text style={[styles.versionText, { color: appColors.textMuted }]}>
            {t('settings.version')}
          </Text>
          <Text style={[styles.copyrightText, { color: appColors.textMuted }]}>
            {t('settings.copyright')}
          </Text>
        </View>
      </ScrollView>

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
              style={[styles.googleButton, { backgroundColor: appColors.card, borderColor: appColors.border }, isSubmitting && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
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
              style={[styles.submitButton, { backgroundColor: appColors.primary }, isSubmitting && styles.buttonDisabled]}
              onPress={handleAuthSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  group: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 20,
  },
  signOutText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  copyrightText: {
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
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
