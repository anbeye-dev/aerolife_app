import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Category, Expense, MonthlyIncome, SavingsGoal } from '@/types';

interface BudgetState {
  categories: Category[];
  expenses: Expense[];
  monthlyIncome: MonthlyIncome | null;
  savingsGoals: SavingsGoal[];
  selectedMonth: string;
  loading: boolean;

  fetchData: (userId: string) => Promise<void>;
  addExpense: (userId: string, categoryId: string, amount: number, description?: string) => Promise<void>;
  updateExpense: (expenseId: string, amount: number, description?: string) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  setMonthlyIncome: (userId: string, amount: number) => Promise<void>;
  addSavingsGoal: (userId: string, name: string, targetAmount: number, deadline?: string) => Promise<void>;
  updateSavingsGoal: (goalId: string, currentAmount: number) => Promise<void>;
  deleteSavingsGoal: (goalId: string) => Promise<void>;
  getMonthlyExpenses: () => number;
  getCategoryExpenses: (categoryId: string) => number;
  getRemainingBalance: () => number;
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

export const useBudgetStore = create<BudgetState>((set, get) => ({
  categories: [],
  expenses: [],
  monthlyIncome: null,
  savingsGoals: [],
  selectedMonth: getCurrentMonth(),
  loading: false,

  fetchData: async (userId) => {
    set({ loading: true });
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*');

      const monthStart = get().selectedMonth;
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('date', monthStart)
        .lt('date', monthEnd.toISOString().split('T')[0]);

      const { data: income } = await supabase
        .from('monthly_income')
        .select('*')
        .eq('user_id', userId)
        .eq('month', monthStart)
        .single();

      const { data: goals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId);

      set({
        categories: categories?.map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          budgetLimit: c.budget_limit,
          color: c.color,
        })) || [],
        expenses: expenses?.map((e: any) => ({
          id: e.id,
          categoryId: e.category_id,
          amount: e.amount,
          description: e.description,
          date: e.date,
        })) || [],
        monthlyIncome: income ? {
          id: income.id,
          amount: income.amount,
          month: income.month,
        } : null,
        savingsGoals: goals?.map((g: any) => ({
          id: g.id,
          name: g.name,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          deadline: g.deadline,
        })) || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      set({ loading: false });
    }
  },

  addExpense: async (userId, categoryId, amount, description) => {
    const { data } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount,
        description,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (data) {
      set(state => ({
        expenses: [
          ...state.expenses,
          {
            id: data.id,
            categoryId: data.category_id,
            amount: data.amount,
            description: data.description,
            date: data.date,
          },
        ],
      }));
    }
  },

  updateExpense: async (expenseId, amount, description) => {
    await supabase
      .from('expenses')
      .update({ amount, description })
      .eq('id', expenseId);

    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId ? { ...e, amount, description } : e
      ),
    }));
  },

  deleteExpense: async (expenseId) => {
    await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    set(state => ({
      expenses: state.expenses.filter(e => e.id !== expenseId),
    }));
  },

  setMonthlyIncome: async (userId, amount) => {
    const month = get().selectedMonth;
    const existing = get().monthlyIncome;

    if (existing) {
      await supabase
        .from('monthly_income')
        .update({ amount })
        .eq('id', existing.id);
    } else {
      const { data } = await supabase
        .from('monthly_income')
        .insert({
          user_id: userId,
          amount,
          month,
        })
        .select()
        .single();

      if (data) {
        set({
          monthlyIncome: {
            id: data.id,
            amount: data.amount,
            month: data.month,
          },
        });
      }
    }

    set(state => ({
      monthlyIncome: state.monthlyIncome
        ? { ...state.monthlyIncome, amount }
        : null,
    }));
  },

  addSavingsGoal: async (userId, name, targetAmount, deadline) => {
    const { data } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name,
        target_amount: targetAmount,
        current_amount: 0,
        deadline,
      })
      .select()
      .single();

    if (data) {
      set(state => ({
        savingsGoals: [
          ...state.savingsGoals,
          {
            id: data.id,
            name: data.name,
            targetAmount: data.target_amount,
            currentAmount: data.current_amount,
            deadline: data.deadline,
          },
        ],
      }));
    }
  },

  updateSavingsGoal: async (goalId, currentAmount) => {
    await supabase
      .from('savings_goals')
      .update({ current_amount: currentAmount })
      .eq('id', goalId);

    set(state => ({
      savingsGoals: state.savingsGoals.map(g =>
        g.id === goalId ? { ...g, currentAmount } : g
      ),
    }));
  },

  deleteSavingsGoal: async (goalId) => {
    await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goalId);

    set(state => ({
      savingsGoals: state.savingsGoals.filter(g => g.id !== goalId),
    }));
  },

  getMonthlyExpenses: () => {
    return get().expenses.reduce((sum, e) => sum + e.amount, 0);
  },

  getCategoryExpenses: (categoryId) => {
    return get().expenses
      .filter(e => e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getRemainingBalance: () => {
    const income = get().monthlyIncome?.amount || 0;
    const expenses = get().getMonthlyExpenses();
    return income - expenses;
  },
}));
