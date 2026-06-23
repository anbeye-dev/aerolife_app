import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Target,
  ChevronRight,
  Calendar,
  Plus,
  X,
  Check,
  Edit3,
  FileText,
  Award,
} from 'lucide-react-native';
import { Card, ProgressBar, Button, CircularProgress } from '@/components/ui';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme';
import { usePart66Store, useSettingsStore } from '@/stores';
import { Module, ModuleStatus } from '@/types';
import { i18n } from '@/lib/i18n';

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export default function Part66Screen() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showQCMModal, setShowQCMModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [qcmScore, setQcmScore] = useState('');
  const [qcmTotal, setQcmTotal] = useState('20');
  const [studyMinutes, setStudyMinutes] = useState('30');
  const [notes, setNotes] = useState('');

  const language = useSettingsStore((state) => state.language);
  const modules = usePart66Store((state) => state.modules);
  const weeklyStudyMinutes = usePart66Store((state) => state.weeklyStudyMinutes);
  const weeklyStudyGoal = usePart66Store((state) => state.weeklyStudyGoal);
  const fetchModules = usePart66Store((state) => state.fetchModules);
  const updateModuleStatus = usePart66Store((state) => state.updateModuleStatus);
  const updateModuleProgress = usePart66Store((state) => state.updateModuleProgress);
  const updateModuleNotes = usePart66Store((state) => state.updateModuleNotes);
  const setExamDate = usePart66Store((state) => state.setExamDate);
  const addQCM = usePart66Store((state) => state.addQCM);
  const addStudySession = usePart66Store((state) => state.addStudySession);
  const loading = usePart66Store((state) => state.loading);

  const t = i18n.translate(language);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const inProgressModules = modules.filter((m) => m.status === 'in_progress').length;
  const overallProgress =
    modules.reduce((sum, m) => sum + m.progress, 0) / modules.length || 0;
  const studyProgress = Math.min((weeklyStudyMinutes / weeklyStudyGoal) * 100, 100);

  const statusColors: Record<ModuleStatus, string> = {
    not_started: colors.light.textTertiary,
    in_progress: colors.light.primary,
    completed: colors.light.secondary,
  };

  const statusLabels: Record<ModuleStatus, string> = {
    not_started: t.part66.status.notStarted,
    in_progress: t.part66.status.inProgress,
    completed: t.part66.status.completed,
  };

  const handleOpenModule = (module: Module) => {
    setSelectedModule(module);
    setNotes(module.notes || '');
    setShowModuleModal(true);
  };

  const handleUpdateStatus = async (status: ModuleStatus) => {
    if (!selectedModule) return;
    await updateModuleStatus(selectedModule.id, status);
    setSelectedModule({ ...selectedModule, status });
  };

  const handleUpdateProgress = async (progress: number) => {
    if (!selectedModule) return;
    await updateModuleProgress(selectedModule.id, progress);
    setSelectedModule({ ...selectedModule, progress });
  };

  const handleSaveNotes = async () => {
    if (!selectedModule) return;
    await updateModuleNotes(selectedModule.id, notes);
    setSelectedModule({ ...selectedModule, notes });
  };

  const handleAddQCM = async () => {
    if (!selectedModule || !qcmScore || !qcmTotal) return;
    await addQCM(selectedModule.id, parseInt(qcmScore), parseInt(qcmTotal));
    setShowQCMModal(false);
    setQcmScore('');
  };

  const handleAddStudySession = async () => {
    if (!studyMinutes) return;
    await addStudySession(
      'anonymous',
      selectedModule?.id || null,
      parseInt(studyMinutes),
      notes
    );
    setShowStudyModal(false);
    setStudyMinutes('30');
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.part66.title}</Text>
            <Text style={styles.subtitle}>{t.part66.subtitle}</Text>
          </View>
          <View style={styles.logoContainer}>
            <GraduationCap size={32} color={colors.light.primary} />
          </View>
        </View>

        {/* Overall Progress */}
        <Card style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <View>
              <Text style={styles.overallTitle}>{t.part66.totalProgress}</Text>
              <Text style={styles.overallValue}>
                {completedModules}/{modules.length} {t.part66.modules}
              </Text>
            </View>
            <CircularProgress
              progress={overallProgress}
              size={80}
              color={colors.light.primary}
            />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statDot,
                  { backgroundColor: colors.light.secondary },
                ]}
              />
              <Text style={styles.statLabel}>{t.part66.completed}</Text>
              <Text style={styles.statValue}>{completedModules}</Text>
            </View>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statDot,
                  { backgroundColor: colors.light.primary },
                ]}
              />
              <Text style={styles.statLabel}>{t.part66.inProgress}</Text>
              <Text style={styles.statValue}>{inProgressModules}</Text>
            </View>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statDot,
                  { backgroundColor: colors.light.textTertiary },
                ]}
              />
              <Text style={styles.statLabel}>{t.part66.toDo}</Text>
              <Text style={styles.statValue}>
                {modules.length - completedModules - inProgressModules}
              </Text>
            </View>
          </View>
        </Card>

        {/* Study Goal */}
        <Card style={styles.studyGoalCard}>
          <View style={styles.studyGoalHeader}>
            <View style={styles.studyGoalTitle}>
              <Target size={20} color={colors.light.secondary} />
              <Text style={styles.studyGoalLabel}>{t.part66.weeklyGoal}</Text>
            </View>
            <Text style={styles.studyGoalValue}>
              {formatTime(weeklyStudyMinutes)} / {formatTime(weeklyStudyGoal)}
            </Text>
          </View>
          <ProgressBar
            progress={studyProgress}
            height={10}
            color={colors.light.secondary}
          />
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setShowStudyModal(true)}
          >
            <Clock size={24} color={colors.light.primary} />
            <Text style={styles.quickActionText}>{t.part66.newSession}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => {
              if (selectedModule) {
                setShowQCMModal(true);
              }
            }}
          >
            <Award size={24} color={colors.light.secondary} />
            <Text style={styles.quickActionText}>{t.part66.addQCM}</Text>
          </TouchableOpacity>
        </View>

        {/* Module List */}
        <Text style={styles.sectionTitle}>{t.part66.modules}</Text>
        <View style={styles.moduleList}>
          {modules.map((module, index) => (
            <TouchableOpacity
              key={module.id}
              onPress={() => handleOpenModule(module)}
            >
              <ModuleCard
                module={module}
                index={index}
                statusColors={statusColors}
                language={language}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Module Detail Modal */}
      <Modal visible={showModuleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t.part66.module} {selectedModule?.moduleNumber}
              </Text>
              <TouchableOpacity onPress={() => setShowModuleModal(false)}>
                <X size={24} color={colors.light.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.moduleName}>{selectedModule?.name}</Text>
            <Text style={styles.moduleCategory}>
              {selectedModule?.category}
            </Text>

            <ProgressBar
              progress={selectedModule?.progress || 0}
              height={10}
              color={colors.light.primary}
              showLabel
              style={styles.progressSection}
            />

            <View style={styles.statusButtons}>
              {(['not_started', 'in_progress', 'completed'] as ModuleStatus[]).map(
                (status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      selectedModule?.status === status && styles.statusButtonActive,
                      { borderColor: statusColors[status] },
                      selectedModule?.status === status && {
                        backgroundColor: statusColors[status],
                      },
                    ]}
                    onPress={() => handleUpdateStatus(status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        selectedModule?.status === status && styles.statusTextActive,
                      ]}
                    >
                      {statusLabels[status]}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.label}>{t.part66.notes} (%)</Text>
            <TextInput
              style={styles.input}
              value={String(selectedModule?.progress || 0)}
              onChangeText={(text) =>
                setSelectedModule((prev) =>
                  prev ? { ...prev, progress: parseInt(text) || 0 } : null
                )
              }
              onBlur={() => handleUpdateProgress(selectedModule?.progress || 0)}
              keyboardType="numeric"
            />

            <Text style={styles.label}>{t.part66.notes}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder={t.part66.notePlaceholder}
            />

            <Button
              title={t.part66.saveNotes}
              onPress={handleSaveNotes}
              variant="outline"
              style={styles.saveButton}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalAction}
                onPress={() => setShowQCMModal(true)}
              >
                <Award size={20} color={colors.light.primary} />
                <Text style={styles.modalActionText}>{t.part66.addQCM}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAction}
                onPress={() => setShowStudyModal(true)}
              >
                <Clock size={20} color={colors.light.primary} />
                <Text style={styles.modalActionText}>{t.part66.studySession}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QCM Modal */}
      <Modal visible={showQCMModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.part66.qcmResult}</Text>
              <TouchableOpacity onPress={() => setShowQCMModal(false)}>
                <X size={24} color={colors.light.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>{t.part66.score}</Text>
            <TextInput
              style={styles.input}
              value={qcmScore}
              onChangeText={setQcmScore}
              keyboardType="numeric"
              placeholder={t.part66.scoreObtained}
            />
            <Text style={styles.label}>{t.part66.scoreTotal}</Text>
            <TextInput
              style={styles.input}
              value={qcmTotal}
              onChangeText={setQcmTotal}
              keyboardType="numeric"
              placeholder={t.part66.scoreMaximum}
            />
            <Button title={t.common.save} onPress={handleAddQCM} />
          </View>
        </View>
      </Modal>

      {/* Study Session Modal */}
      <Modal visible={showStudyModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.part66.studySession}</Text>
              <TouchableOpacity onPress={() => setShowStudyModal(false)}>
                <X size={24} color={colors.light.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>{t.part66.duration}</Text>
            <TextInput
              style={styles.input}
              value={studyMinutes}
              onChangeText={setStudyMinutes}
              keyboardType="numeric"
              placeholder="30"
            />
            <Text style={styles.label}>{t.part66.studyNotes} ({t.common.optional})</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder={t.part66.studiedPlaceholder}
            />
            <Button title={t.common.save} onPress={handleAddStudySession} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface ModuleCardProps {
  module: Module;
  index: number;
  statusColors: Record<ModuleStatus, string>;
  language: 'fr' | 'en';
}

function ModuleCard({ module, index, statusColors, language }: ModuleCardProps) {
  return (
    <Animated.View entering={FadeIn.delay(index * 50)}>
      <Card style={styles.moduleCard}>
        <View style={styles.moduleCardHeader}>
          <View
            style={[
              styles.moduleNumberBadge,
              { backgroundColor: `${statusColors[module.status]}20` },
            ]}
          >
            <Text
              style={[
                styles.moduleNumberText,
                { color: statusColors[module.status] },
              ]}
            >
              {module.moduleNumber}
            </Text>
          </View>
          <View style={styles.moduleCardInfo}>
            <Text style={styles.moduleTitle} numberOfLines={2}>
              {module.name}
            </Text>
            <Text style={styles.moduleMeta}>
              {module.category} | {formatTime(module.timeSpentMinutes)}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.light.textTertiary} />
        </View>
        <ProgressBar
          progress={module.progress}
          height={6}
          color={statusColors[module.status]}
        />
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.light.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  overallValue: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: spacing.xs,
  },
  studyGoalCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  studyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  studyGoalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  studyGoalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  studyGoalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.light.surface,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  moduleList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  moduleCard: {
    marginBottom: spacing.xs,
  },
  moduleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moduleNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  moduleCardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  moduleMeta: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.light.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  smallModalContent: {
    backgroundColor: colors.light.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  moduleCategory: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  statusButtonActive: {},
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  statusTextActive: {
    color: colors.light.surface,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.light.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  modalAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: `${colors.light.primary}15`,
    borderRadius: borderRadius.md,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.primary,
  },
});
