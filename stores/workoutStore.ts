import { create } from 'zustand';
import { WORKOUT_PROGRAM } from '@/lib/workouts';
import { supabase } from '@/lib/supabase';
import { WorkoutSession, ExerciseCompletion, ExerciseHistory } from '@/types';

interface WorkoutState {
  currentWeek: number;
  sessions: Record<string, WorkoutSession>;
  exerciseHistory: ExerciseHistory[];
  streak: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  loading: boolean;

  fetchSessions: (userId: string) => Promise<void>;
  startSession: (userId: string, dayNumber: number) => Promise<WorkoutSession | null>;
  completeSet: (sessionId: string, exerciseId: string, setIndex: number) => Promise<void>;
  updateWeight: (sessionId: string, exerciseId: string, weight: number) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
  getExerciseProgress: (exerciseName: string) => { weight: number; date: string }[];
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  currentWeek: 1,
  sessions: {},
  exerciseHistory: [],
  streak: 0,
  weeklyGoal: 4,
  weeklyCompleted: 0,
  loading: false,

  fetchSessions: async (userId) => {
    set({ loading: true });
    try {
      const { data: sessionsData } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          day_number,
          date,
          completed,
          exercise_completions (
            id,
            exercise_name,
            sets,
            reps,
            weight,
            completed_sets,
            rest_seconds
          )
        `)
        .eq('user_id', userId);

      const sessions: Record<string, WorkoutSession> = {};
      sessionsData?.forEach((s: any) => {
        sessions[s.id] = {
          id: s.id,
          dayNumber: s.day_number,
          date: s.date,
          completed: s.completed,
          exercises: s.exercise_completions.map((e: any) => ({
            id: e.id,
            exerciseName: e.exercise_name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            completedSets: e.completed_sets || [],
            restSeconds: e.rest_seconds,
          })),
        };
      });

      const { data: history } = await supabase
        .from('exercise_history')
        .select('*')
        .eq('user_id', userId);

      // Calculate streak
      const uniqueDates = [...new Set(sessionsData?.map((s: any) => s.date) || [])];
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const hasSession = uniqueDates.includes(dateStr) || i === 0;
        if (hasSession) streak++;
        else break;
      }

      // Weekly completed
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weeklyCompleted = sessionsData?.filter((s: any) =>
        new Date(s.date) >= weekStart && s.completed
      ).length || 0;

      set({
        sessions,
        exerciseHistory: history?.map((h: any) => ({
          id: h.id,
          exerciseName: h.exercise_name,
          weight: h.weight,
          date: h.date,
        })) || [],
        streak,
        weeklyCompleted,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      set({ loading: false });
    }
  },

  startSession: async (userId, dayNumber) => {
    const workout = WORKOUT_PROGRAM.find(w => w.dayNumber === dayNumber);
    if (!workout) return null;

    const today = new Date().toISOString().split('T')[0];

    const { data: session } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        day_number: dayNumber,
        date: today,
        completed: false,
      })
      .select()
      .single();

    if (!session) return null;

    const exerciseCompletions: ExerciseCompletion[] = [];

    for (const exercise of workout.exercises) {
      const { data: completion } = await supabase
        .from('exercise_completions')
        .insert({
          session_id: session.id,
          exercise_name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.defaultWeight,
          completed_sets: [],
          rest_seconds: exercise.restSeconds,
        })
        .select()
        .single();

      if (completion) {
        exerciseCompletions.push({
          id: completion.id,
          exerciseName: completion.exercise_name,
          sets: completion.sets,
          reps: completion.reps,
          weight: completion.weight,
          completedSets: [],
          restSeconds: completion.rest_seconds,
        });
      }
    }

    const newSession: WorkoutSession = {
      id: session.id,
      dayNumber: session.day_number,
      date: session.date,
      completed: session.completed,
      exercises: exerciseCompletions,
    };

    set(state => ({
      sessions: { ...state.sessions, [session.id]: newSession }
    }));

    return newSession;
  },

  completeSet: async (sessionId, exerciseId, setIndex) => {
    const session = get().sessions[sessionId];
    if (!session) return;

    const exercise = session.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    let newCompletedSets: number[];
    if (exercise.completedSets.includes(setIndex)) {
      newCompletedSets = exercise.completedSets.filter(i => i !== setIndex);
    } else {
      newCompletedSets = [...exercise.completedSets, setIndex];
    }

    await supabase
      .from('exercise_completions')
      .update({ completed_sets: newCompletedSets })
      .eq('id', exerciseId);

    set(state => ({
      sessions: {
        ...state.sessions,
        [sessionId]: {
          ...session,
          exercises: session.exercises.map(e =>
            e.id === exerciseId ? { ...e, completedSets: newCompletedSets } : e
          ),
        },
      },
    }));
  },

  updateWeight: async (sessionId, exerciseId, weight) => {
    const session = get().sessions[sessionId];
    if (!session) return;

    await supabase
      .from('exercise_completions')
      .update({ weight })
      .eq('id', exerciseId);

    set(state => ({
      sessions: {
        ...state.sessions,
        [sessionId]: {
          ...session,
          exercises: session.exercises.map(e =>
            e.id === exerciseId ? { ...e, weight } : e
          ),
        },
      },
    }));
  },

  completeSession: async (sessionId) => {
    const session = get().sessions[sessionId];
    if (!session) return;

    await supabase
      .from('workout_sessions')
      .update({ completed: true })
      .eq('id', sessionId);

    // Save to exercise history
    for (const exercise of session.exercises) {
      if (exercise.completedSets.length > 0) {
        await supabase
          .from('exercise_history')
          .insert({
            user_id: 'anonymous',
            exercise_name: exercise.exerciseName,
            weight: exercise.weight,
            date: session.date,
          });
      }
    }

    set(state => ({
      sessions: {
        ...state.sessions,
        [sessionId]: { ...session, completed: true },
      },
      weeklyCompleted: state.weeklyCompleted + 1,
      streak: state.streak + 1,
    }));
  },

  getExerciseProgress: (exerciseName) => {
    const history = get().exerciseHistory.filter(h =>
      h.exerciseName.toLowerCase().includes(exerciseName.toLowerCase())
    );
    return history.map(h => ({ weight: h.weight, date: h.date }));
  },
}));
