import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import {
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  X,
  Plus,
  Minus,
} from 'lucide-react-native';
import { Card, ProgressBar, Button } from '@/components/ui';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme';
import { WORKOUT_PROGRAM } from '@/lib/workouts';
import { useWorkoutStore, useSettingsStore } from '@/stores';
import { WorkoutSession, ExerciseCompletion } from '@/types';
import { i18n } from '@/lib/i18n';

export default function SportScreen() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [restTimer, setRestTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const language = useSettingsStore((state) => state.language);
  const streak = useWorkoutStore((state) => state.streak);
  const weeklyCompleted = useWorkoutStore((state) => state.weeklyCompleted);
  const weeklyGoal = useWorkoutStore((state) => state.weeklyGoal);
  const sessions = useWorkoutStore((state) => state.sessions);
  const startSession = useWorkoutStore((state) => state.startSession);
  const completeSet = useWorkoutStore((state) => state.completeSet);
  const updateWeight = useWorkoutStore((state) => state.updateWeight);
  const completeSession = useWorkoutStore((state) => state.completeSession);

  const t = i18n.translate(language);

  useEffect(() => {
    if (isTimerRunning && restTimer > 0) {
      timerRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, restTimer]);

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setRestTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStartWorkout = async () => {
    const session = await startSession('anonymous', selectedDay);
    if (session) {
      setCurrentSession(session);
      setShowDetail(true);
    }
  };

  const handleCompleteSet = async (exerciseId: string, setIndex: number) => {
    if (!currentSession) return;
    await completeSet(currentSession.id, exerciseId, setIndex);
    const exercise = currentSession.exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      startRestTimer(exercise.restSeconds);
    }
    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((e) => {
          if (e.id === exerciseId) {
            const completedSets = e.completedSets.includes(setIndex)
              ? e.completedSets.filter((i) => i !== setIndex)
              : [...e.completedSets, setIndex];
            return { ...e, completedSets };
          }
          return e;
        }),
      };
    });
  };

  const handleUpdateWeight = async (exerciseId: string, weight: number) => {
    if (!currentSession) return;
    await updateWeight(currentSession.id, exerciseId, weight);
    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === exerciseId ? { ...e, weight } : e
        ),
      };
    });
  };

  const handleCompleteSession = async () => {
    if (!currentSession) return;
    await completeSession(currentSession.id);
    setCurrentSession(null);
    setShowDetail(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const todayWorkout = WORKOUT_PROGRAM.find((w) => w.dayNumber === selectedDay);
  const sessionProgress = currentSession
    ? currentSession.exercises.reduce(
        (sum, e) => sum + e.completedSets.length,
        0
      ) /
      currentSession.exercises.reduce((sum, e) => sum + e.sets, 0)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.sport.title}</Text>
          <View style={styles.streakBadge}>
            <Calendar size={16} color={colors.light.warning} />
            <Text style={styles.streakText}>{streak} {t.sport.daysStreak}</Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{t.sport.weeklyGoal}</Text>
            <Text style={styles.progressValue}>
              {weeklyCompleted}/{weeklyGoal}
            </Text>
          </View>
          <ProgressBar
            progress={(weeklyCompleted / weeklyGoal) * 100}
            height={12}
            color={colors.light.primary}
          />
        </Card>

        {/* Training Days */}
        <View style={styles.daysContainer}>
          {WORKOUT_PROGRAM.map((workout) => (
            <TouchableOpacity
              key={workout.dayNumber}
              style={[
                styles.dayButton,
                selectedDay === workout.dayNumber && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDay(workout.dayNumber)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === workout.dayNumber && styles.dayTextActive,
                ]}
              >
                J{workout.dayNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Workout */}
        <Animated.View entering={SlideInRight.springify()}>
          <Card style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View>
                <Text style={styles.workoutTitle}>
                  {t.sport.day} {selectedDay}: {todayWorkout?.title}
                </Text>
                <Text style={styles.workoutMeta}>
                  {todayWorkout?.exercises.length} {t.sport.exercises}
                </Text>
              </View>
              <Dumbbell size={28} color={colors.light.primary} />
            </View>

            {!showDetail ? (
              <Button
                title={t.sport.startSession}
                onPress={handleStartWorkout}
                icon={<Play size={18} color={colors.light.surface} />}
                style={styles.startButton}
              />
            ) : (
              <>
                <ProgressBar
                  progress={sessionProgress * 100}
                  height={8}
                  color={colors.light.secondary}
                />
                <Text style={styles.progressLabel}>
                  {Math.round(sessionProgress * 100)}% {t.sport.completed}
                </Text>
              </>
            )}
          </Card>
        </Animated.View>

        {/* Rest Timer */}
        {restTimer > 0 && (
          <Card style={styles.timerCard}>
            <View style={styles.timerContent}>
              <Clock size={24} color={colors.light.primary} />
              <Text style={styles.timerText}>{formatTime(restTimer)}</Text>
              <View style={styles.timerButtons}>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() =>
                    isTimerRunning ? pauseTimer() : setIsTimerRunning(true)
                  }
                >
                  {isTimerRunning ? (
                    <Pause size={20} color={colors.light.text} />
                  ) : (
                    <Play size={20} color={colors.light.text} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={resetTimer}
                >
                  <RotateCcw size={20} color={colors.light.text} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Exercise List */}
        {showDetail && currentSession && (
          <View style={styles.exerciseList}>
            {currentSession.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                onCompleteSet={(setIndex) =>
                  handleCompleteSet(exercise.id, setIndex)
                }
                onUpdateWeight={(weight) =>
                  handleUpdateWeight(exercise.id, weight)
                }
                restLabel={t.sport.rest}
              />
            ))}
          </View>
        )}

        {/* Exercise Preview (when not in session) */}
        {!showDetail && (
          <View style={styles.exerciseList}>
            {todayWorkout?.exercises.map((exercise, index) => (
              <Card key={index} style={styles.exercisePreviewCard}>
                <View style={styles.exercisePreviewHeader}>
                  <Text style={styles.exerciseNumber}>{index + 1}</Text>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {exercise.sets} × {exercise.reps}
                    </Text>
                  </View>
                  <Text style={styles.exerciseWeight}>
                    {exercise.defaultWeight} kg
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Complete Session Button */}
        {showDetail && currentSession && (
          <View style={styles.completeButtonContainer}>
            <Button
              title={t.sport.endSession}
              onPress={handleCompleteSession}
              variant="secondary"
              size="lg"
              style={styles.completeButton}
            />
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface ExerciseCardProps {
  exercise: ExerciseCompletion;
  index: number;
  onCompleteSet: (setIndex: number) => void;
  onUpdateWeight: (weight: number) => void;
  restLabel: string;
}

function ExerciseCard({
  exercise,
  index,
  onCompleteSet,
  onUpdateWeight,
  restLabel,
}: ExerciseCardProps) {
  const [weight, setWeight] = useState(exercise.weight.toString());

  const setsArray = Array.from({ length: exercise.sets }, (_, i) => i);

  return (
    <Animated.View entering={FadeIn.delay(index * 100)}>
      <Card style={styles.exerciseCard}>
        <View style={styles.exerciseCardHeader}>
          <Text style={styles.exerciseNumber}>{index + 1}</Text>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
            <Text style={styles.exerciseMeta}>
              {exercise.sets} × {exercise.reps} | {exercise.restSeconds}s {restLabel}
            </Text>
          </View>
        </View>

        {/* Weight Selector */}
        <View style={styles.weightSelector}>
          <TouchableOpacity
            style={styles.weightButton}
            onPress={() => {
              const newWeight = Math.max(0, parseFloat(weight) - 1);
              setWeight(newWeight.toString());
              onUpdateWeight(newWeight);
            }}
          >
            <Minus size={18} color={colors.light.primary} />
          </TouchableOpacity>
          <View style={styles.weightDisplay}>
            <Text style={styles.weightValue}>{weight}</Text>
            <Text style={styles.weightUnit}>kg</Text>
          </View>
          <TouchableOpacity
            style={styles.weightButton}
            onPress={() => {
              const newWeight = parseFloat(weight) + 1;
              setWeight(newWeight.toString());
              onUpdateWeight(newWeight);
            }}
          >
            <Plus size={18} color={colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Sets */}
        <View style={styles.setsContainer}>
          {setsArray.map((setIndex) => (
            <TouchableOpacity
              key={setIndex}
              style={[
                styles.setButton,
                exercise.completedSets.includes(setIndex) &&
                  styles.setButtonCompleted,
              ]}
              onPress={() => onCompleteSet(setIndex)}
            >
              {exercise.completedSets.includes(setIndex) ? (
                <CheckCircle2 size={20} color={colors.light.surface} />
              ) : (
                <Circle size={20} color={colors.light.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.warning,
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.primary,
  },
  daysContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dayButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.light.surface,
  },
  dayButtonActive: {
    backgroundColor: colors.light.primary,
    ...shadows.sm,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  dayTextActive: {
    color: colors.light.surface,
  },
  workoutCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
  },
  workoutMeta: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  startButton: {
    marginTop: spacing.sm,
  },
  progressLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: spacing.sm,
  },
  timerCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.light.accent,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.light.primary,
    minWidth: 80,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.light.surface,
  },
  exerciseList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  exercisePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exercisePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseCard: {
    marginBottom: spacing.sm,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    backgroundColor: `${colors.light.primary}20`,
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 32,
  },
  exerciseInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  exerciseMeta: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  exerciseWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  weightSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  weightButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.light.surfaceSecondary,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  weightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.light.text,
  },
  weightUnit: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  setsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  setButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  setButtonCompleted: {
    backgroundColor: colors.light.secondary,
  },
  completeButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  completeButton: {
    width: '100%',
  },
});
