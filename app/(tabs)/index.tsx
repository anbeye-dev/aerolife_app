import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, GraduationCap, Wallet, Flame, Calendar, TrendingUp } from 'lucide-react-native';
import { Card, ProgressBar, CircularProgress } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/lib/theme';
import { MOTIVATIONAL_QUOTES } from '@/lib/workouts';
import { useWorkoutStore, usePart66Store, useBudgetStore, useSettingsStore } from '@/stores';
import { i18n } from '@/lib/i18n';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [quote] = useState(
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  const userName = useSettingsStore((state) => state.userName);
  const language = useSettingsStore((state) => state.language);
  const streak = useWorkoutStore((state) => state.streak);
  const weeklyCompleted = useWorkoutStore((state) => state.weeklyCompleted);
  const weeklyGoal = useWorkoutStore((state) => state.weeklyGoal);
  const modules = usePart66Store((state) => state.modules);
  const weeklyStudyMinutes = usePart66Store((state) => state.weeklyStudyMinutes);
  const weeklyStudyGoal = usePart66Store((state) => state.weeklyStudyGoal);
  const getMonthlyExpenses = useBudgetStore((state) => state.getMonthlyExpenses);
  const monthlyIncome = useBudgetStore((state) => state.monthlyIncome);
  const fetchModules = usePart66Store((state) => state.fetchModules);

  const t = i18n.translate(language);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchModules();
    setRefreshing(false);
  };

  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const totalModules = modules.length;
  const studyProgress = Math.min((weeklyStudyMinutes / weeklyStudyGoal) * 100, 100);
  const workoutProgress = Math.min((weeklyCompleted / weeklyGoal) * 100, 100);

  const spendingPercentage =
    monthlyIncome && monthlyIncome.amount > 0
      ? Math.min((getMonthlyExpenses() / monthlyIncome.amount) * 100, 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {t.home.greeting}{userName ? `, ${userName}` : ''}
            </Text>
            <Text style={styles.title}>AeroLife</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={20} color={colors.light.warning} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        {/* Motivational Quote */}
        <Card style={styles.quoteCard} variant="filled">
          <Text style={styles.quoteText}>"{quote}"</Text>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Dumbbell size={24} color={colors.light.primary} />
              <Text style={styles.statTitle}>{t.nav.sport}</Text>
            </View>
            <CircularProgress
              progress={workoutProgress}
              size={80}
              color={colors.light.primary}
            >
              <Text style={styles.progressText}>
                {weeklyCompleted}/{weeklyGoal}
              </Text>
            </CircularProgress>
            <Text style={styles.statSubtitle}>{t.home.sessionsThisWeek}</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <GraduationCap size={24} color={colors.light.secondary} />
              <Text style={styles.statTitle}>{t.nav.part66}</Text>
            </View>
            <CircularProgress
              progress={completedModules > 0 ? (completedModules / totalModules) * 100 : 0}
              size={80}
              color={colors.light.secondary}
            >
              <Text style={styles.progressText}>
                {completedModules}/{totalModules}
              </Text>
            </CircularProgress>
            <Text style={styles.statSubtitle}>{t.home.modulesCompleted}</Text>
          </Card>
        </View>

        {/* Study Progress */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.home.studyGoal}</Text>
            <Text style={styles.cardValue}>
              {Math.round(studyProgress)}%
            </Text>
          </View>
          <ProgressBar
            progress={studyProgress}
            height={12}
            color={colors.light.secondary}
          />
          <Text style={styles.cardSubtitle}>
            {weeklyStudyMinutes} / {weeklyStudyGoal} {t.home.minThisWeek}
          </Text>
        </Card>

        {/* Budget Overview */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Wallet size={20} color={colors.light.primary} />
            </View>
            <Text style={styles.cardTitle}>{t.home.monthlyExpenses}</Text>
          </View>
          <View style={styles.budgetContent}>
            <Text style={styles.budgetAmount}>
              {getMonthlyExpenses().toFixed(2)} €
            </Text>
            {monthlyIncome && (
              <>
                <ProgressBar
                  progress={spendingPercentage}
                  height={8}
                  color={spendingPercentage > 80 ? colors.light.warning : colors.light.primary}
                />
                <View style={styles.budgetDetails}>
                  <Text style={styles.budgetLabel}>
                    {t.home.budget}: {monthlyIncome.amount.toFixed(2)} €
                  </Text>
                  <Text style={styles.budgetLabel}>
                    {t.home.remaining}: {(monthlyIncome.amount - getMonthlyExpenses()).toFixed(2)} €
                  </Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Today's Tasks */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color={colors.light.primary} />
            </View>
            <Text style={styles.cardTitle}>{t.home.todayTasks}</Text>
          </View>
          <View style={styles.taskList}>
            <View style={styles.taskItem}>
              <View style={[styles.taskDot, { backgroundColor: colors.light.primary }]} />
              <Text style={styles.taskText}>{t.home.training} J{new Date().getDay() % 4 || 1}</Text>
            </View>
            <View style={styles.taskItem}>
              <View style={[styles.taskDot, { backgroundColor: colors.light.secondary }]} />
              <Text style={styles.taskText}>30 {t.home.revision}</Text>
            </View>
            <View style={styles.taskItem}>
              <View style={[styles.taskDot, { backgroundColor: colors.light.warning }]} />
              <Text style={styles.taskText}>{t.home.updateExpenses}</Text>
            </View>
          </View>
        </Card>

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
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
  greeting: {
    fontSize: 16,
    color: colors.light.textSecondary,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.light.primary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.light.warning}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.warning,
  },
  quoteCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.primary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.light.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetContent: {
    gap: spacing.sm,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.light.text,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  taskList: {
    gap: spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskText: {
    fontSize: 14,
    color: colors.light.text,
  },
});
