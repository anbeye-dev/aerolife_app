import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Module, ModuleQCM, StudySession } from '@/types';

interface Part66State {
  modules: Module[];
  studySessions: StudySession[];
  weeklyStudyGoal: number;
  weeklyStudyMinutes: number;
  loading: boolean;

  fetchModules: () => Promise<void>;
  updateModuleStatus: (moduleId: string, status: string) => Promise<void>;
  updateModuleProgress: (moduleId: string, progress: number) => Promise<void>;
  updateModuleNotes: (moduleId: string, notes: string) => Promise<void>;
  setExamDate: (moduleId: string, date: string) => Promise<void>;
  addQCM: (moduleId: string, score: number, totalQuestions: number) => Promise<void>;
  addStudySession: (userId: string, moduleId: string | null, durationMinutes: number, notes?: string) => Promise<void>;
  getModuleStats: (moduleId: string) => { avgScore: number; totalTime: number; qcms: ModuleQCM[] };
}

export const usePart66Store = create<Part66State>((set, get) => ({
  modules: [],
  studySessions: [],
  weeklyStudyGoal: 600,
  weeklyStudyMinutes: 0,
  loading: false,

  fetchModules: async () => {
    set({ loading: true });
    try {
      const { data: modules } = await supabase
        .from('modules')
        .select('*')
        .order('module_number');

      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('*');

      // Calculate weekly study time
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weeklyMinutes = studySessions?.filter((s: any) =>
        new Date(s.date) >= weekStart
      ).reduce((sum: number, s: any) => sum + s.duration_minutes, 0) || 0;

      set({
        modules: modules?.map((m: any) => ({
          id: m.id,
          moduleNumber: m.module_number,
          name: m.name,
          category: m.category,
          status: m.status,
          progress: m.progress,
          examDate: m.exam_date,
          timeSpentMinutes: m.time_spent_minutes,
          notes: m.notes,
        })) || [],
        studySessions: studySessions?.map((s: any) => ({
          id: s.id,
          moduleId: s.module_id,
          durationMinutes: s.duration_minutes,
          date: s.date,
          notes: s.notes,
        })) || [],
        weeklyStudyMinutes: weeklyMinutes,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching modules:', error);
      set({ loading: false });
    }
  },

  updateModuleStatus: async (moduleId, status) => {
    await supabase
      .from('modules')
      .update({ status })
      .eq('id', moduleId);

    set(state => ({
      modules: state.modules.map(m =>
        m.id === moduleId ? { ...m, status: status as any } : m
      ),
    }));
  },

  updateModuleProgress: async (moduleId, progress) => {
    const newStatus = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
    await supabase
      .from('modules')
      .update({ progress, status: newStatus })
      .eq('id', moduleId);

    set(state => ({
      modules: state.modules.map(m =>
        m.id === moduleId ? { ...m, progress, status: newStatus as any } : m
      ),
    }));
  },

  updateModuleNotes: async (moduleId, notes) => {
    await supabase
      .from('modules')
      .update({ notes })
      .eq('id', moduleId);

    set(state => ({
      modules: state.modules.map(m =>
        m.id === moduleId ? { ...m, notes } : m
      ),
    }));
  },

  setExamDate: async (moduleId, date) => {
    await supabase
      .from('modules')
      .update({ exam_date: date })
      .eq('id', moduleId);

    set(state => ({
      modules: state.modules.map(m =>
        m.id === moduleId ? { ...m, examDate: date } : m
      ),
    }));
  },

  addQCM: async (moduleId, score, totalQuestions) => {
    await supabase
      .from('module_qcms')
      .insert({
        module_id: moduleId,
        score,
        total_questions: totalQuestions,
      });
  },

  addStudySession: async (userId, moduleId, durationMinutes, notes) => {
    await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        module_id: moduleId,
        duration_minutes: durationMinutes,
        notes,
      });

    if (moduleId) {
      await supabase.rpc('increment_study_time', {
        module_id: moduleId,
        minutes: durationMinutes,
      });
    }

    set(state => ({
      weeklyStudyMinutes: state.weeklyStudyMinutes + durationMinutes,
      studySessions: [
        ...state.studySessions,
        {
          id: Date.now().toString(),
          moduleId: moduleId || undefined,
          durationMinutes,
          date: new Date().toISOString().split('T')[0],
          notes,
        },
      ],
    }));
  },

  getModuleStats: (moduleId) => {
    const module = get().modules.find(m => m.id === moduleId);
    const qcms: ModuleQCM[] = [];

    const avgScore = qcms.length > 0
      ? qcms.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / qcms.length
      : 0;

    return {
      avgScore,
      totalTime: module?.timeSpentMinutes || 0,
      qcms,
    };
  },
}));
