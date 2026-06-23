// Sport Types
export interface WorkoutSession {
  id: string;
  dayNumber: number;
  date: string;
  completed: boolean;
  exercises: ExerciseCompletion[];
}

export interface ExerciseCompletion {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  weight: number;
  completedSets: number[];
  restSeconds: number;
}

export interface ExerciseHistory {
  id: string;
  exerciseName: string;
  weight: number;
  date: string;
}

// PART-66 Types
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface Module {
  id: string;
  moduleNumber: number;
  name: string;
  category: string;
  status: ModuleStatus;
  progress: number;
  examDate?: string;
  timeSpentMinutes: number;
  notes?: string;
}

export interface ModuleQCM {
  id: string;
  moduleId: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface StudySession {
  id: string;
  moduleId?: string;
  durationMinutes: number;
  date: string;
  notes?: string;
}

// Budget Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  budgetLimit: number;
  color: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description?: string;
  date: string;
}

export interface MonthlyIncome {
  id: string;
  amount: number;
  month: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

// Exercise definitions
export interface ExerciseDefinition {
  name: string;
  sets: number;
  reps: string;
  defaultWeight: number;
  restSeconds: number;
}

export interface WorkoutDay {
  dayNumber: number;
  title: string;
  exercises: ExerciseDefinition[];
}
