import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Cloud,
  Download,
  User,
  ChevronRight,
  Info,
  Shield,
  HelpCircle,
  Globe,
  X,
} from 'lucide-react-native';
import { Card, ProgressBar } from '@/components/ui';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme';
import { useSettingsStore, useWorkoutStore, useBudgetStore } from '@/stores';
import { i18n, Language } from '@/lib/i18n';

export default function SettingsScreen() {
  const theme = useSettingsStore((state) => state.theme);
  const notifications = useSettingsStore((state) => state.notifications);
  const autoBackup = useSettingsStore((state) => state.autoBackup);
  const userName = useSettingsStore((state) => state.userName);
  const language = useSettingsStore((state) => state.language);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setNotifications = useSettingsStore((state) => state.setNotifications);
  const setAutoBackup = useSettingsStore((state) => state.setAutoBackup);
  const setUserName = useSettingsStore((state) => state.setUserName);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const [showNameInput, setShowNameInput] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const t = i18n.translate(language);

  const handleExport = async () => {
    try {
      await Share.share({
        message: 'Export AeroLife - Coming soon',
        title: 'Export Aerolife Data',
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (onPress && <ChevronRight size={20} color={colors.light.textTertiary} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.settings.title}</Text>
        </View>

        {/* Profile Section */}
        <Card style={styles.section}>
          <SettingItem
            icon={<User size={22} color={colors.light.primary} />}
            title={t.settings.name}
            subtitle={userName || t.settings.notDefined}
            onPress={() => {
              setShowNameInput(true);
              setTempName(userName);
            }}
          />
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Shield size={22} color={colors.light.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t.settings.subscriber}</Text>
              <Text style={styles.settingSubtitle}>{t.settings.freeVersion}</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Appearance Section */}
        <Text style={styles.sectionLabel}>{t.settings.appearance}</Text>
        <Card style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              {theme === 'dark' ? (
                <Moon size={22} color={colors.light.primary} />
              ) : (
                <Sun size={22} color={colors.light.primary} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t.settings.theme}</Text>
              <Text style={styles.settingSubtitle}>
                {theme === 'system'
                  ? t.settings.themeSystem
                  : theme === 'dark'
                    ? t.settings.themeDark
                    : t.settings.themeLight}
              </Text>
            </View>
            <View style={styles.themeButtons}>
              {(['system', 'light', 'dark'] as const).map((themeOption) => (
                <TouchableOpacity
                  key={themeOption}
                  style={[styles.themeButton, theme === themeOption && styles.themeButtonActive]}
                  onPress={() => setTheme(themeOption)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      theme === themeOption && styles.themeButtonTextActive,
                    ]}
                  >
                    {themeOption === 'system'
                      ? t.settings.themeSystem.slice(0, 3)
                      : themeOption === 'light'
                        ? t.settings.themeLight.slice(0, 4)
                        : t.settings.themeDark.slice(0, 5)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.divider} />
          <SettingItem
            icon={<Globe size={22} color={colors.light.primary} />}
            title={t.settings.language}
            subtitle={language === 'fr' ? t.languages.fr : t.languages.en}
            onPress={() => setShowLanguageModal(true)}
          />
        </Card>

        {/* Notifications Section */}
        <Text style={styles.sectionLabel}>{t.settings.notifications}</Text>
        <Card style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell size={22} color={colors.light.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t.settings.enableNotifications}</Text>
              <Text style={styles.settingSubtitle}>
                {t.settings.notificationHint}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.light.border, true: colors.light.primary }}
              thumbColor={colors.light.surface}
            />
          </View>
        </Card>

        {/* Data Section */}
        <Text style={styles.sectionLabel}>{t.settings.data}</Text>
        <Card style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Cloud size={22} color={colors.light.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t.settings.autoBackup}</Text>
              <Text style={styles.settingSubtitle}>
                {t.settings.autoBackupHint}
              </Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ false: colors.light.border, true: colors.light.primary }}
              thumbColor={colors.light.surface}
            />
          </View>
          <View style={styles.divider} />
          <SettingItem
            icon={<Download size={22} color={colors.light.primary} />}
            title={t.settings.exportData}
            subtitle={t.settings.exportPdf}
            onPress={handleExport}
          />
        </Card>

        {/* About Section */}
        <Text style={styles.sectionLabel}>{t.settings.about}</Text>
        <Card style={styles.section}>
          <SettingItem
            icon={<Info size={22} color={colors.light.primary} />}
            title={t.settings.version}
            subtitle="1.0.0"
          />
          <View style={styles.divider} />
          <SettingItem
            icon={<HelpCircle size={22} color={colors.light.primary} />}
            title={t.settings.helpSupport}
            onPress={() => console.log('Help pressed')}
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>AeroLife</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>2024 AeroLife App</Text>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Name Input Modal */}
      {showNameInput && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.settings.name}</Text>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              placeholder={t.settings.namePlaceholder}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowNameInput(false)}
              >
                <Text style={styles.modalButtonText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setUserName(tempName);
                  setShowNameInput(false);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {t.common.save}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.settings.language}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color={colors.light.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>{t.settings.languageHint}</Text>
            {(['fr', 'en'] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageOption,
                  language === lang && styles.languageOptionActive,
                ]}
                onPress={() => {
                  setLanguage(lang);
                  setShowLanguageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.languageText,
                    language === lang && styles.languageTextActive,
                  ]}
                >
                  {lang === 'fr' ? t.languages.fr : t.languages.en}
                </Text>
                {language === lang && (
                  <View style={styles.checkMark}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.light.text,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.light.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  themeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.light.surfaceSecondary,
  },
  themeButtonActive: {
    backgroundColor: colors.light.primary,
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.light.textSecondary,
  },
  themeButtonTextActive: {
    color: colors.light.surface,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
  },
  version: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  copyright: {
    fontSize: 12,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.light.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.light.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.light.surfaceSecondary,
  },
  modalButtonPrimary: {
    backgroundColor: colors.light.primary,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  modalButtonTextPrimary: {
    color: colors.light.surface,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.light.surfaceSecondary,
  },
  languageOptionActive: {
    backgroundColor: `${colors.light.primary}15`,
    borderWidth: 2,
    borderColor: colors.light.primary,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.light.text,
  },
  languageTextActive: {
    color: colors.light.primary,
    fontWeight: '600',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.light.surface,
    fontWeight: '700',
  },
});
