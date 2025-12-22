// Liste complète des exercices de musculation avec traductions FR/EN
const EXERCISES = [
  // ===== PECTORAUX (Chest) =====
  { id: 1, name: 'Développé couché', nameEn: 'Bench Press', muscleGroup: 'pectoraux', difficulty: 'intermediate' },
  { id: 2, name: 'Développé incliné', nameEn: 'Incline Bench Press', muscleGroup: 'pectoraux', difficulty: 'intermediate' },
  { id: 3, name: 'Développé décliné', nameEn: 'Decline Bench Press', muscleGroup: 'pectoraux', difficulty: 'intermediate' },
  { id: 4, name: 'Écarté couché', nameEn: 'Dumbbell Flyes', muscleGroup: 'pectoraux', difficulty: 'intermediate' },
  { id: 5, name: 'Écarté incliné', nameEn: 'Incline Dumbbell Flyes', muscleGroup: 'pectoraux', difficulty: 'intermediate' },
  { id: 6, name: 'Pompes', nameEn: 'Push-ups', muscleGroup: 'pectoraux', difficulty: 'beginner' },
  { id: 7, name: 'Pompes inclinées', nameEn: 'Incline Push-ups', muscleGroup: 'pectoraux', difficulty: 'beginner' },
  { id: 8, name: 'Pompes déclinées', nameEn: 'Decline Push-ups', muscleGroup: 'pectoraux', difficulty: 'advanced' },
  { id: 9, name: 'Machine pectoraux', nameEn: 'Chest Press Machine', muscleGroup: 'pectoraux', difficulty: 'beginner' },
  { id: 10, name: 'Peck Deck', nameEn: 'Peck Deck', muscleGroup: 'pectoraux', difficulty: 'beginner' },

  // ===== DOS (Back) =====
  { id: 11, name: 'Tirage poitrine', nameEn: 'Lat Pulldown', muscleGroup: 'dos', difficulty: 'beginner' },
  { id: 12, name: 'Tirage nuque', nameEn: 'Pulldown Behind Neck', muscleGroup: 'dos', difficulty: 'intermediate' },
  { id: 13, name: 'Tractions', nameEn: 'Pull-ups', muscleGroup: 'dos', difficulty: 'advanced' },
  { id: 14, name: 'Tractions assistées', nameEn: 'Assisted Pull-ups', muscleGroup: 'dos', difficulty: 'intermediate' },
  { id: 15, name: 'Tirage horizontal', nameEn: 'Barbell Row', muscleGroup: 'dos', difficulty: 'intermediate' },
  { id: 16, name: 'Tirage haltère', nameEn: 'Dumbbell Row', muscleGroup: 'dos', difficulty: 'intermediate' },
  { id: 17, name: 'Tirage machine', nameEn: 'Cable Row', muscleGroup: 'dos', difficulty: 'beginner' },
  { id: 18, name: 'Soulevé de terre', nameEn: 'Deadlift', muscleGroup: 'dos', difficulty: 'advanced' },
  { id: 19, name: 'Soulevé roumain', nameEn: 'Romanian Deadlift', muscleGroup: 'dos', difficulty: 'intermediate' },
  { id: 20, name: 'Good Mornings', nameEn: 'Good Mornings', muscleGroup: 'dos', difficulty: 'intermediate' },
  { id: 21, name: 'Hyperextension', nameEn: 'Back Hyperextension', muscleGroup: 'dos', difficulty: 'beginner' },

  // ===== ÉPAULES (Shoulders) =====
  { id: 22, name: 'Développé militaire', nameEn: 'Military Press', muscleGroup: 'épaules', difficulty: 'intermediate' },
  { id: 23, name: 'Développé haltère', nameEn: 'Dumbbell Shoulder Press', muscleGroup: 'épaules', difficulty: 'intermediate' },
  { id: 24, name: 'Développé assis', nameEn: 'Seated Shoulder Press', muscleGroup: 'épaules', difficulty: 'beginner' },
  { id: 25, name: 'Élévation latérale', nameEn: 'Lateral Raise', muscleGroup: 'épaules', difficulty: 'beginner' },
  { id: 26, name: 'Élévation antérieure', nameEn: 'Front Raise', muscleGroup: 'épaules', difficulty: 'beginner' },
  { id: 27, name: 'Élévation postérieure', nameEn: 'Rear Delt Flyes', muscleGroup: 'épaules', difficulty: 'beginner' },
  { id: 28, name: 'Tirage nuque', nameEn: 'Upright Row', muscleGroup: 'épaules', difficulty: 'intermediate' },
  { id: 29, name: 'Machine épaules', nameEn: 'Shoulder Press Machine', muscleGroup: 'épaules', difficulty: 'beginner' },
  { id: 30, name: 'Dips épaules', nameEn: 'Dips (Shoulders)', muscleGroup: 'épaules', difficulty: 'advanced' },
  { id: 31, name: 'Shrugs haltères', nameEn: 'Dumbbell Shrugs', muscleGroup: 'épaules', difficulty: 'beginner' },
  { id: 32, name: 'Shrugs barre', nameEn: 'Barbell Shrugs', muscleGroup: 'épaules', difficulty: 'beginner' },

  // ===== BICEPS (Biceps) =====
  { id: 33, name: 'Curl haltère', nameEn: 'Dumbbell Curl', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 34, name: 'Curl barre', nameEn: 'Barbell Curl', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 35, name: 'Curl machine', nameEn: 'Biceps Curl Machine', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 36, name: 'Curl pupitre', nameEn: 'Preacher Curl', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 37, name: 'Curl inversé', nameEn: 'Reverse Curl', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 38, name: 'Curl marteau', nameEn: 'Hammer Curl', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 39, name: 'Curl câble', nameEn: 'Cable Curl', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 40, name: 'Curl concentré', nameEn: 'Concentration Curl', muscleGroup: 'biceps', difficulty: 'beginner' },
  { id: 41, name: 'Curl Larry Scott', nameEn: 'Scott Curl', muscleGroup: 'biceps', difficulty: 'intermediate' },

  // ===== TRICEPS (Triceps) =====
  { id: 42, name: 'Dips', nameEn: 'Dips', muscleGroup: 'triceps', difficulty: 'advanced' },
  { id: 43, name: 'Dips assistés', nameEn: 'Assisted Dips', muscleGroup: 'triceps', difficulty: 'intermediate' },
  { id: 44, name: 'Extension verticale', nameEn: 'Overhead Extension', muscleGroup: 'triceps', difficulty: 'beginner' },
  { id: 45, name: 'Extension couché', nameEn: 'Skull Crushers', muscleGroup: 'triceps', difficulty: 'intermediate' },
  { id: 46, name: 'Tirage corde', nameEn: 'Tricep Rope Pushdown', muscleGroup: 'triceps', difficulty: 'beginner' },
  { id: 47, name: 'Tirage triceps', nameEn: 'Tricep Pushdown', muscleGroup: 'triceps', difficulty: 'beginner' },
  { id: 48, name: 'Extension haltère', nameEn: 'Dumbbell Overhead Extension', muscleGroup: 'triceps', difficulty: 'beginner' },
  { id: 49, name: 'Kickback', nameEn: 'Tricep Kickback', muscleGroup: 'triceps', difficulty: 'beginner' },
  { id: 50, name: 'Barre fermée', nameEn: 'Close Grip Bench Press', muscleGroup: 'triceps', difficulty: 'intermediate' },
  { id: 51, name: 'Machine triceps', nameEn: 'Tricep Press Machine', muscleGroup: 'triceps', difficulty: 'beginner' },

  // ===== AVANT-BRAS (Forearms) =====
  { id: 52, name: 'Flexion poignet', nameEn: 'Wrist Curl', muscleGroup: 'avant-bras', difficulty: 'beginner' },
  { id: 53, name: 'Extension poignet', nameEn: 'Reverse Wrist Curl', muscleGroup: 'avant-bras', difficulty: 'beginner' },
  { id: 54, name: 'Pronation supination', nameEn: 'Pronation Supination', muscleGroup: 'avant-bras', difficulty: 'beginner' },

  // ===== JAMBES (Legs) =====
  { id: 55, name: 'Squat', nameEn: 'Squat', muscleGroup: 'jambes', difficulty: 'intermediate' },
  { id: 56, name: 'Squat goblet', nameEn: 'Goblet Squat', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 57, name: 'Squat guidé', nameEn: 'Smith Machine Squat', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 58, name: 'Squat machine', nameEn: 'Leg Press', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 59, name: 'Fentes avant', nameEn: 'Lunges', muscleGroup: 'jambes', difficulty: 'intermediate' },
  { id: 60, name: 'Fentes walking', nameEn: 'Walking Lunges', muscleGroup: 'jambes', difficulty: 'intermediate' },
  { id: 61, name: 'Fentes inversées', nameEn: 'Reverse Lunges', muscleGroup: 'jambes', difficulty: 'intermediate' },
  { id: 62, name: 'Leg curl', nameEn: 'Leg Curl', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 63, name: 'Leg extension', nameEn: 'Leg Extension', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 64, name: 'Presse jambes machine', nameEn: 'Machine Leg Press', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 65, name: 'Leg press 45°', nameEn: '45 Degree Leg Press', muscleGroup: 'jambes', difficulty: 'intermediate' },
  { id: 66, name: 'Hip thrust', nameEn: 'Hip Thrust', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 67, name: 'Hip thrust machine', nameEn: 'Hip Thrust Machine', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 68, name: 'Bulgarian split squat', nameEn: 'Bulgarian Split Squat', muscleGroup: 'jambes', difficulty: 'intermediate' },
  { id: 69, name: 'Step ups', nameEn: 'Step Ups', muscleGroup: 'jambes', difficulty: 'intermediate' },
  { id: 70, name: 'Sissy squat', nameEn: 'Sissy Squat', muscleGroup: 'jambes', difficulty: 'advanced' },

  // ===== FESSES (Glutes) =====
  { id: 71, name: 'Hip thrust barre', nameEn: 'Barbell Hip Thrust', muscleGroup: 'fesses', difficulty: 'intermediate' },
  { id: 72, name: 'Soulevé de terre jambes tendues', nameEn: 'Stiff Leg Deadlift', muscleGroup: 'fesses', difficulty: 'intermediate' },
  { id: 73, name: 'Abduction machine', nameEn: 'Abduction Machine', muscleGroup: 'fesses', difficulty: 'beginner' },
  { id: 74, name: 'Kickback machine', nameEn: 'Glute Kickback', muscleGroup: 'fesses', difficulty: 'beginner' },

  // ===== ABS/CORE (Abs) =====
  { id: 75, name: 'Crunches', nameEn: 'Crunches', muscleGroup: 'abs', difficulty: 'beginner' },
  { id: 76, name: 'Sit-ups', nameEn: 'Sit-ups', muscleGroup: 'abs', difficulty: 'beginner' },
  { id: 77, name: 'Relevé de jambes', nameEn: 'Leg Raises', muscleGroup: 'abs', difficulty: 'intermediate' },
  { id: 78, name: 'Machine abs', nameEn: 'Ab Machine', muscleGroup: 'abs', difficulty: 'beginner' },
  { id: 79, name: 'Abdominale câble', nameEn: 'Cable Crunch', muscleGroup: 'abs', difficulty: 'beginner' },
  { id: 80, name: 'Planche', nameEn: 'Plank', muscleGroup: 'abs', difficulty: 'intermediate' },
  { id: 81, name: 'Planche latérale', nameEn: 'Side Plank', muscleGroup: 'abs', difficulty: 'intermediate' },
  { id: 82, name: 'Mountain climbers', nameEn: 'Mountain Climbers', muscleGroup: 'abs', difficulty: 'intermediate' },
  { id: 83, name: 'Wheel ab', nameEn: 'Ab Wheel Rollout', muscleGroup: 'abs', difficulty: 'advanced' },

  // Additional exercises from workout programs
  { id: 84, name: 'Mollets debout', nameEn: 'Standing Calf Raise', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 85, name: 'Mollets assis', nameEn: 'Seated Calf Raise', muscleGroup: 'jambes', difficulty: 'beginner' },
  { id: 86, name: 'Curl incliné', nameEn: 'Incline Dumbbell Curl', muscleGroup: 'biceps', difficulty: 'intermediate' },
  { id: 87, name: 'Face pulls', nameEn: 'Face Pulls', muscleGroup: 'épaules', difficulty: 'beginner' },
  { id: 88, name: 'Vide abdominal', nameEn: 'Vacuum Hold', muscleGroup: 'abs', difficulty: 'intermediate' },
  { id: 89, name: 'Russian twist', nameEn: 'Russian Twist', muscleGroup: 'abs', difficulty: 'intermediate' },
  { id: 90, name: 'Développé incliné Haltère', nameEn: 'Incline Dumbbell Press', muscleGroup: 'pectoraux', difficulty: 'intermediate' },
];

export default EXERCISES;
