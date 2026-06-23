import { WorkoutDay } from '@/types';

export const WORKOUT_PROGRAM: WorkoutDay[] = [
  {
    dayNumber: 1,
    title: 'Haut du corps',
    exercises: [
      { name: 'Pompes avec disque au dos', sets: 4, reps: '10', defaultWeight: 5, restSeconds: 60 },
      { name: 'Tirage bûcheron', sets: 4, reps: '10', defaultWeight: 20, restSeconds: 60 },
      { name: 'Développé militaire assis', sets: 3, reps: '10', defaultWeight: 15, restSeconds: 60 },
      { name: 'Élévations latérales', sets: 3, reps: '10', defaultWeight: 8, restSeconds: 45 },
      { name: 'Curl biceps debout', sets: 3, reps: '10', defaultWeight: 10, restSeconds: 45 },
      { name: 'Extension triceps', sets: 3, reps: '10', defaultWeight: 10, restSeconds: 45 },
    ],
  },
  {
    dayNumber: 2,
    title: 'Bas du corps',
    exercises: [
      { name: 'Goblet squat', sets: 4, reps: '10', defaultWeight: 15, restSeconds: 90 },
      { name: 'Fentes arrière', sets: 3, reps: '10 par jambe', defaultWeight: 10, restSeconds: 60 },
      { name: 'Soulevé de terre roumain', sets: 3, reps: '10', defaultWeight: 20, restSeconds: 90 },
      { name: 'Mollets avec haltères', sets: 4, reps: '10', defaultWeight: 20, restSeconds: 45 },
      { name: 'Crunches', sets: 2, reps: '15', defaultWeight: 0, restSeconds: 30 },
      { name: 'Gainage', sets: 1, reps: '30-60s', defaultWeight: 0, restSeconds: 30 },
    ],
  },
  {
    dayNumber: 3,
    title: 'Haut du corps',
    exercises: [
      { name: 'Pompes surélevées avec disque', sets: 4, reps: '10', defaultWeight: 5, restSeconds: 60 },
      { name: 'Tractions', sets: 4, reps: '10', defaultWeight: 0, restSeconds: 90 },
      { name: 'Tirage bûcheron', sets: 4, reps: '10 par côté', defaultWeight: 20, restSeconds: 60 },
      { name: 'Oiseau aux haltères', sets: 3, reps: '10', defaultWeight: 5, restSeconds: 45 },
      { name: 'Curl biceps assis', sets: 3, reps: '10', defaultWeight: 12, restSeconds: 45 },
      { name: 'Extension triceps vers le haut', sets: 3, reps: '10', defaultWeight: 10, restSeconds: 45 },
    ],
  },
  {
    dayNumber: 4,
    title: 'Bas du corps',
    exercises: [
      { name: 'Squats sautés avec haltères', sets: 4, reps: '10', defaultWeight: 10, restSeconds: 60 },
      { name: 'Squats bulgares', sets: 3, reps: '8', defaultWeight: 12, restSeconds: 60 },
      { name: 'Soulevé de terre roumain', sets: 4, reps: '10', defaultWeight: 22, restSeconds: 90 },
      { name: 'Crunch bicyclette', sets: 3, reps: '8 par côté', defaultWeight: 0, restSeconds: 30 },
      { name: 'Gainage latéral', sets: 2, reps: '30-60s', defaultWeight: 0, restSeconds: 30 },
    ],
  },
];

export const MOTIVATIONAL_QUOTES = [
  "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.",
  "Chaque séance vous rapproche de vos objectifs.",
  "La discipline est le pont entre vos objectifs et vos accomplissements.",
  "Le seul mauvais entraînement est celui qui n'a pas eu lieu.",
  "Vouloir se surpasser est le premier pas vers la réussite.",
  "Ne regardez pas l'horloge, faites ce qui est nécessaire.",
  "Votre corps peut tout supporter. C'est votre esprit que vous devez convaincre.",
  "Les petites victoires d'aujourd'hui construisent les succès de demain.",
];
