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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';
import {
  Wallet,
  Plus,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Calendar,
  Trash2,
  Edit3,
  ChevronRight,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { Card, ProgressBar, Button } from '@/components/ui';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme';
import { useBudgetStore, useSettingsStore } from '@/stores';
import { Expense, Category } from '@/types';
import { i18n } from '@/lib/i18n';

const { width } = Dimensions.get('window');
const PIE_SIZE = 180;
const PIE_CENTER = PIE_SIZE / 2;

export default function BudgetScreen() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCategoryDetail, setShowCategoryDetail] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');

  const language = useSettingsStore((state) => state.language);
  const categories = useBudgetStore((state) => state.categories);
  const expenses = useBudgetStore((state) => state.expenses);
  const monthlyIncome = useBudgetStore((state) => state.monthlyIncome);
  const savingsGoals = useBudgetStore((state) => state.savingsGoals);
  const fetchData = useBudgetStore((state) => state.fetchData);
  const addExpense = useBudgetStore((state) => state.addExpense);
  const deleteExpense = useBudgetStore((state) => state.deleteExpense);
  const setMonthlyIncome = useBudgetStore((state) => state.setMonthlyIncome);
  const addSavingsGoal = useBudgetStore((state) => state.addSavingsGoal);
  const updateSavingsGoal = useBudgetStore((state) => state.updateSavingsGoal);
  const deleteSavingsGoal = useBudgetStore((state) => state.deleteSavingsGoal);
  const getMonthlyExpenses = useBudgetStore((state) => state.getMonthlyExpenses);
  const getCategoryExpenses = useBudgetStore((state) => state.getCategoryExpenses);
  const getRemainingBalance = useBudgetStore((state) => state.getRemainingBalance);
  const loading = useBudgetStore((state) => state.loading);

  const t = i18n.translate(language);

  useEffect(() => {
    fetchData('anonymous');
  }, [fetchData]);

  const totalExpenses = getMonthlyExpenses();
  const remainingBalance = getRemainingBalance();
  const spendingPercentage =
    monthlyIncome && monthlyIncome.amount > 0
      ? (totalExpenses / monthlyIncome.amount) * 100
      : 0;

  const getCategoryData = () => {
    return categories
      .map((cat) => ({
        ...cat,
        amount: getCategoryExpenses(cat.id),
      }))
      .filter((cat) => cat.amount > 0);
  };

  const categoryData = getCategoryData();

  const handleAddExpense = async () => {
    if (!selectedCategory || !expenseAmount) return;
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) return;

    await addExpense('anonymous', selectedCategory, amount, expenseDescription);
    setShowAddExpense(false);
    setExpenseAmount('');
    setExpenseDescription('');
    setSelectedCategory('');
  };

  const handleSetIncome = async () => {
    const amount = parseFloat(incomeAmount);
    if (isNaN(amount) || amount <= 0) return;

    await setMonthlyIncome('anonymous', amount);
    setShowIncomeModal(false);
    setIncomeAmount('');
  };

  const handleAddGoal = async () => {
    if (!goalName || !goalAmount) return;
    const amount = parseFloat(goalAmount);
    if (isNaN(amount) || amount <= 0) return;

    await addSavingsGoal('anonymous', goalName, amount);
    setShowGoalModal(false);
    setGoalName('');
    setGoalAmount('');
  };

  const renderPieChart = () => {
    if (categoryData.length === 0) return null;

    const totalAmount = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
    let currentAngle = 0;
    const paths: { path: string; color: string; amount: number }[] = [];

    categoryData.forEach((cat) => {
      const percentage = cat.amount / totalAmount;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const x1 = PIE_CENTER + PIE_CENTER * Math.cos((startAngle * Math.PI) / 180 - Math.PI / 2);
      const y1 = PIE_CENTER + PIE_CENTER * Math.sin((startAngle * Math.PI) / 180 - Math.PI / 2);
      const x2 = PIE_CENTER + PIE_CENTER * Math.cos((endAngle * Math.PI) / 180 - Math.PI / 2);
      const y2 = PIE_CENTER + PIE_CENTER * Math.sin((endAngle * Math.PI) / 180 - Math.PI / 2);
      const largeArc = angle > 180 ? 1 : 0;

      const pathD = `M ${PIE_CENTER} ${PIE_CENTER} L ${x1} ${y1} A ${PIE_CENTER} ${PIE_CENTER} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      paths.push({ path: pathD, color: cat.color, amount: cat.amount });
    });

    return (
      <Svg width={PIE_SIZE} height={PIE_SIZE}>
        <G>
          {paths.map((p, i) => (
            <Path key={i} d={p.path} fill={p.color} />
          ))}
        </G>
      </Svg>
    );
  };

  const currentMonth = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.budget.title}</Text>
            <Text style={styles.subtitle}>{currentMonth}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddExpense(true)}
          >
            <Plus size={24} color={colors.light.surface} />
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceIcon}>
              <Wallet size={24} color={colors.light.primary} />
            </View>
            <TouchableOpacity onPress={() => setShowIncomeModal(true)}>
              <Edit3 size={18} color={colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceLabel}>{t.budget.remainingBalance}</Text>
          <Text
            style={[
              styles.balanceAmount,
              remainingBalance < 0 && styles.negativeBalance,
            ]}
          >
            {remainingBalance.toFixed(2)} €
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <TrendingUp size={16} color={colors.light.secondary} />
              <Text style={styles.balanceDetailText}>
                {t.budget.income}: {monthlyIncome?.amount.toFixed(2) || 0} €
              </Text>
            </View>
            <View style={styles.balanceDetailItem}>
              <TrendingDown size={16} color={colors.light.error} />
              <Text style={styles.balanceDetailText}>
                {t.budget.expenses}: {totalExpenses.toFixed(2)} €
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={Math.min(spendingPercentage, 100)}
            height={8}
            color={
              spendingPercentage > 80
                ? colors.light.warning
                : spendingPercentage > 100
                  ? colors.light.error
                  : colors.light.primary
            }
          />
          {spendingPercentage > 80 && (
            <View style={styles.alertContainer}>
              <AlertTriangle size={14} color={colors.light.warning} />
              <Text style={styles.alertText}>
                {spendingPercentage >= 100
                  ? t.budget.budgetExceeded
                  : t.budget.budgetWarning}
              </Text>
            </View>
          )}
        </Card>

        {/* Spending by Category */}
        {categoryData.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>{t.budget.spendingDistribution}</Text>
            <View style={styles.chartContainer}>
              <View style={styles.pieChartContainer}>{renderPieChart()}</View>
              <View style={styles.chartLegend}>
                {categoryData.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.legendItem}
                    onPress={() => setShowCategoryDetail(cat)}
                  >
                    <View
                      style={[styles.legendDot, { backgroundColor: cat.color }]}
                    />
                    <Text style={styles.legendText}>{cat.name}</Text>
                    <Text style={styles.legendAmount}>
                      {cat.amount.toFixed(0)} €
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        )}

        {/* Categories with Budget */}
        <Text style={styles.sectionHeader}>{t.budget.categories}</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((cat, index) => {
            const spent = getCategoryExpenses(cat.id);
            const percentage =
              cat.budgetLimit > 0 ? (spent / cat.budgetLimit) * 100 : 0;
            const isOverBudget = cat.budgetLimit > 0 && spent > cat.budgetLimit;

            return (
              <Animated.View key={cat.id} entering={FadeIn.delay(index * 50)}>
                <TouchableOpacity
                  onPress={() => setShowCategoryDetail(cat)}
                >
                  <Card style={styles.categoryCard}>
                    <View style={styles.categoryRow}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: cat.color },
                        ]}
                      />
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text
                        style={[
                          styles.categoryAmount,
                          isOverBudget && styles.overBudget,
                        ]}
                      >
                        {spent.toFixed(2)} €
                      </Text>
                    </View>
                    {cat.budgetLimit > 0 && (
                      <ProgressBar
                        progress={Math.min(percentage, 100)}
                        height={4}
                        color={isOverBudget ? colors.light.error : cat.color}
                      />
                    )}
                    {cat.budgetLimit > 0 && (
                      <Text style={styles.categoryBudget}>
                        {t.home.budget}: {cat.budgetLimit.toFixed(2)} €
                      </Text>
                    )}
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Savings Goals */}
        <Text style={styles.sectionHeader}>{t.budget.savingsGoals}</Text>
        <Card style={styles.goalsCard}>
          {savingsGoals.length === 0 ? (
            <View style={styles.emptyGoals}>
              <PiggyBank size={48} color={colors.light.textTertiary} />
              <Text style={styles.emptyGoalsText}>
                {t.budget.noSavingsGoals}
              </Text>
              <Button
                title={t.budget.createGoal}
                onPress={() => setShowGoalModal(true)}
                variant="ghost"
                size="sm"
                style={styles.createGoalButton}
              />
            </View>
          ) : (
            <>
              {savingsGoals.map((goal, index) => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <TouchableOpacity
                      onPress={() => deleteSavingsGoal(goal.id)}
                    >
                      <Trash2 size={16} color={colors.light.error} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.goalProgress}>
                    <Text style={styles.goalAmounts}>
                      {goal.currentAmount.toFixed(2)} € / {goal.targetAmount.toFixed(2)} €
                    </Text>
                    <Text style={styles.goalPercent}>
                      {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={(goal.currentAmount / goal.targetAmount) * 100}
                    height={8}
                    color={colors.light.primary}
                  />
                  {goal.deadline && (
                    <Text style={styles.goalDeadline}>
                      <Calendar size={14} color={colors.light.textSecondary} />{' '}
                      {new Date(goal.deadline).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </Text>
                  )}
                </View>
              ))}
              <Button
                title={t.budget.addGoal}
                onPress={() => setShowGoalModal(true)}
                variant="outline"
                size="sm"
              />
            </>
          )}
        </Card>

        {/* Recent Expenses */}
        <Text style={styles.sectionHeader}>{t.budget.recentExpenses}</Text>
        <View style={styles.expensesContainer}>
          {expenses.slice(0, 5).map((expense, index) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              categoryName={
                categories.find((c) => c.id === expense.categoryId)?.name || t.budget.category
              }
              categoryColor={
                categories.find((c) => c.id === expense.categoryId)?.color ||
                colors.light.textTertiary
              }
              onDelete={() => deleteExpense(expense.id)}
              index={index}
            />
          ))}
          {expenses.length === 0 && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t.budget.noExpenses}</Text>
            </Card>
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={showAddExpense} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.budget.newExpense}</Text>
              <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                <X size={24} color={colors.light.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>{t.budget.category}</Text>
            <View style={styles.categorySelector}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <View
                    style={[
                      styles.categoryChipDot,
                      { backgroundColor: cat.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id &&
                        styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>{t.budget.amount} (€)</Text>
            <TextInput
              style={styles.input}
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Text style={styles.modalLabel}>{t.budget.description} ({t.common.optional})</Text>
            <TextInput
              style={styles.input}
              value={expenseDescription}
              onChangeText={setExpenseDescription}
              placeholder={`${t.budget.description}...`}
            />

            <Button title={t.common.add} onPress={handleAddExpense} />
          </View>
        </View>
      </Modal>

      {/* Income Modal */}
      <Modal visible={showIncomeModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.budget.monthlyIncome}</Text>
              <TouchableOpacity onPress={() => setShowIncomeModal(false)}>
                <X size={24} color={colors.light.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>{t.budget.amount} (€)</Text>
            <TextInput
              style={styles.input}
              value={incomeAmount}
              onChangeText={setIncomeAmount}
              keyboardType="decimal-pad"
              placeholder={monthlyIncome?.amount.toFixed(2) || '0.00'}
            />
            <Button title={t.common.save} onPress={handleSetIncome} />
          </View>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal visible={showGoalModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.budget.newGoal}</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <X size={24} color={colors.light.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>{t.budget.goalName}</Text>
            <TextInput
              style={styles.input}
              value={goalName}
              onChangeText={setGoalName}
              placeholder={language === 'fr' ? 'Ex: Voyage' : 'Ex: Trip'}
            />
            <Text style={styles.modalLabel}>{t.budget.targetAmount} (€)</Text>
            <TextInput
              style={styles.input}
              value={goalAmount}
              onChangeText={setGoalAmount}
              keyboardType="decimal-pad"
              placeholder="1000.00"
            />
            <Button title={t.common.create} onPress={handleAddGoal} />
          </View>
        </View>
      </Modal>

      {/* Category Detail Modal */}
      <Modal visible={!!showCategoryDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {showCategoryDetail && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <View
                      style={[
                        styles.categoryBigDot,
                        { backgroundColor: showCategoryDetail.color },
                      ]}
                    />
                    <Text style={styles.modalTitle}>
                      {showCategoryDetail.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowCategoryDetail(null)}
                  >
                    <X size={24} color={colors.light.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.totalSpent}>
                  {getCategoryExpenses(showCategoryDetail.id).toFixed(2)} € {t.budget.spent}
                </Text>
                <ScrollView style={styles.expenseList}>
                  {expenses
                    .filter((e) => e.categoryId === showCategoryDetail.id)
                    .map((exp) => (
                      <View key={exp.id} style={styles.expenseDetailItem}>
                        <Text style={styles.expenseDate}>
                          {new Date(exp.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </Text>
                        <Text style={styles.expenseDesc}>
                          {exp.description || t.budget.noDescription}
                        </Text>
                        <Text style={styles.expenseAmountText}>
                          {exp.amount.toFixed(2)} €
                        </Text>
                        <TouchableOpacity
                          onPress={() => deleteExpense(exp.id)}
                        >
                          <Trash2 size={16} color={colors.light.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface ExpenseItemProps {
  expense: Expense;
  categoryName: string;
  categoryColor: string;
  onDelete: () => void;
  index: number;
}

function ExpenseItem({
  expense,
  categoryName,
  categoryColor,
  onDelete,
  index,
}: ExpenseItemProps) {
  return (
    <Animated.View entering={SlideInRight.delay(index * 50)}>
      <Card style={styles.expenseCard}>
        <View style={styles.expenseRow}>
          <View
            style={[styles.expenseDot, { backgroundColor: categoryColor }]}
          />
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle}>
              {expense.description || categoryName}
            </Text>
            <Text style={styles.expenseCategory}>{categoryName}</Text>
          </View>
          <Text style={styles.expenseValue}>
            {expense.amount.toFixed(2)} €
          </Text>
        </View>
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
    textTransform: 'capitalize',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.light.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.light.text,
    marginVertical: spacing.sm,
  },
  negativeBalance: {
    color: colors.light.error,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  balanceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  balanceDetailText: {
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  alertText: {
    fontSize: 12,
    color: colors.light.warning,
    fontWeight: '500',
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLegend: {
    flex: 1,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    fontSize: 13,
    color: colors.light.text,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryCard: {
    marginBottom: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  overBudget: {
    color: colors.light.error,
  },
  categoryBudget: {
    fontSize: 11,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
  },
  goalsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyGoals: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyGoalsText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: spacing.md,
  },
  createGoalButton: {
    marginTop: spacing.md,
  },
  goalItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  goalAmounts: {
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  goalPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.primary,
  },
  goalDeadline: {
    fontSize: 12,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
  },
  expensesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expenseInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
  },
  expenseCategory: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  expenseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.light.textSecondary,
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
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.light.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.light.text,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.light.surfaceSecondary,
    gap: spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: `${colors.light.primary}20`,
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  categoryChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 13,
    color: colors.light.text,
  },
  categoryChipTextSelected: {
    fontWeight: '600',
    color: colors.light.primary,
  },
  categoryBigDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  totalSpent: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  expenseList: {
    maxHeight: 300,
  },
  expenseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.light.textTertiary,
    width: 80,
  },
  expenseDesc: {
    flex: 1,
    fontSize: 14,
    color: colors.light.text,
  },
  expenseAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginRight: spacing.md,
  },
});
