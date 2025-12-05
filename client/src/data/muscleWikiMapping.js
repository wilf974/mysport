/**
 * MuscleWiki Exercise Mapping
 * Maps exercise names from the app to MuscleWiki exercise data
 *
 * Image format: https://raw.githubusercontent.com/AlimKhan76/musclewiki/main/Images/[filename]
 */

const MUSCLEWIKI_BASE_URL = 'https://raw.githubusercontent.com/AlimKhan76/musclewiki/main/Images';

// Exercise mapping: exercise name -> { equipment, exerciseKey, description, muscleGroup }
const exerciseMapping = {
  // Chest exercises
  'Push Up': {
    equipment: 'bodyweight',
    exerciseKey: 'pushup',
    muscleGroup: 'Chest',
    description: 'Push-up - Bodyweight'
  },
  'Pushup': {
    equipment: 'bodyweight',
    exerciseKey: 'pushup',
    muscleGroup: 'Chest',
    description: 'Push-up - Bodyweight'
  },
  'Bench Press': {
    equipment: 'barbell',
    exerciseKey: 'bench-press',
    muscleGroup: 'Chest',
    description: 'Barbell Bench Press'
  },
  'Barbell Bench Press': {
    equipment: 'barbell',
    exerciseKey: 'bench-press',
    muscleGroup: 'Chest',
    description: 'Barbell Bench Press'
  },
  'Dumbbell Bench Press': {
    equipment: 'dumbbell',
    exerciseKey: 'incline-bench-press',
    muscleGroup: 'Chest',
    description: 'Dumbbell Bench Press'
  },
  'Incline Bench Press': {
    equipment: 'barbell',
    exerciseKey: 'incline-bench-press',
    muscleGroup: 'Chest',
    description: 'Incline Bench Press'
  },
  'Dumbbell Incline Bench Press': {
    equipment: 'dumbbell',
    exerciseKey: 'incline-bench-press',
    muscleGroup: 'Chest',
    description: 'Dumbbell Incline Bench Press'
  },
  'Incline Dumbbell Chest Flys': {
    equipment: 'dumbbell',
    exerciseKey: 'incline-chest-flys',
    muscleGroup: 'Chest',
    description: 'Incline Dumbbell Chest Flys'
  },
  'Chest Flys': {
    equipment: 'dumbbell',
    exerciseKey: 'incline-chest-flys',
    muscleGroup: 'Chest',
    description: 'Dumbbell Chest Flys'
  },
  'Dumbbell Chest Flys': {
    equipment: 'dumbbell',
    exerciseKey: 'incline-chest-flys',
    muscleGroup: 'Chest',
    description: 'Dumbbell Chest Flys'
  },
  'Machine Chest Fly': {
    equipment: 'machine',
    exerciseKey: 'incline-chest-flys',
    muscleGroup: 'Chest',
    description: 'Machine Chest Fly'
  },
  'Chest Fly Machine': {
    equipment: 'machine',
    exerciseKey: 'incline-chest-flys',
    muscleGroup: 'Chest',
    description: 'Chest Fly Machine'
  },
  'Diamond Pushup': {
    equipment: 'bodyweight',
    exerciseKey: 'diamond-pushup',
    muscleGroup: 'Chest',
    description: 'Diamond Push-up'
  },

  // Back exercises
  'Pull Up': {
    equipment: 'bodyweight',
    exerciseKey: 'pull-up',
    muscleGroup: 'Lats',
    description: 'Pull-up - Bodyweight'
  },
  'Pullup': {
    equipment: 'bodyweight',
    exerciseKey: 'pull-up',
    muscleGroup: 'Lats',
    description: 'Pull-up - Bodyweight'
  },
  'Chin Up': {
    equipment: 'bodyweight',
    exerciseKey: 'chin-up',
    muscleGroup: 'Biceps',
    description: 'Chin-up - Bodyweight'
  },
  'Bent Over Row': {
    equipment: 'barbell',
    exerciseKey: 'bent-over-row',
    muscleGroup: 'Lats',
    description: 'Bent Over Barbell Row'
  },
  'Barbell Bent Over Row': {
    equipment: 'barbell',
    exerciseKey: 'bent-over-row',
    muscleGroup: 'Lats',
    description: 'Bent Over Barbell Row'
  },
  'Dumbbell Row': {
    equipment: 'dumbbell',
    exerciseKey: 'row',
    muscleGroup: 'Lats',
    description: 'Dumbbell Row'
  },
  'Machine Row': {
    equipment: 'machine',
    exerciseKey: 'row',
    muscleGroup: 'Lats',
    description: 'Machine Row'
  },
  'Cable Row': {
    equipment: 'machine',
    exerciseKey: 'row',
    muscleGroup: 'Lats',
    description: 'Cable Row'
  },
  'Seated Row': {
    equipment: 'machine',
    exerciseKey: 'row',
    muscleGroup: 'Lats',
    description: 'Seated Row'
  },
  'Machine Shrug': {
    equipment: 'machine',
    exerciseKey: 'shrug',
    muscleGroup: 'Traps',
    description: 'Machine Shrug'
  },
  'Barbell Shrug': {
    equipment: 'barbell',
    exerciseKey: 'shrug',
    muscleGroup: 'Traps',
    description: 'Barbell Shrug'
  },
  'Dumbbell Shrug': {
    equipment: 'dumbbell',
    exerciseKey: 'shrug',
    muscleGroup: 'Traps',
    description: 'Dumbbell Shrug'
  },

  // Shoulder exercises
  'Overhead Press': {
    equipment: 'barbell',
    exerciseKey: 'overhead-press',
    muscleGroup: 'Shoulder',
    description: 'Barbell Overhead Press'
  },
  'Barbell Overhead Press': {
    equipment: 'barbell',
    exerciseKey: 'overhead-press',
    muscleGroup: 'Shoulder',
    description: 'Barbell Overhead Press'
  },
  'Dumbbell Overhead Press': {
    equipment: 'dumbbell',
    exerciseKey: 'seated-overhead-press',
    muscleGroup: 'Shoulder',
    description: 'Dumbbell Overhead Press'
  },
  'Lateral Raise': {
    equipment: 'dumbbell',
    exerciseKey: 'lateral-raise',
    muscleGroup: 'Shoulder',
    description: 'Dumbbell Lateral Raise'
  },
  'Machine Shoulder Press': {
    equipment: 'machine',
    exerciseKey: 'seated-overhead-press',
    muscleGroup: 'Shoulder',
    description: 'Machine Shoulder Press'
  },
  'Shoulder Press Machine': {
    equipment: 'machine',
    exerciseKey: 'seated-overhead-press',
    muscleGroup: 'Shoulder',
    description: 'Shoulder Press Machine'
  },
  'Cable Lateral Raise': {
    equipment: 'machine',
    exerciseKey: 'lateral-raise',
    muscleGroup: 'Shoulder',
    description: 'Cable Lateral Raise'
  },

  // Arm exercises - Biceps
  'Barbell Curl': {
    equipment: 'barbell',
    exerciseKey: 'curl',
    muscleGroup: 'Biceps',
    description: 'Barbell Curl'
  },
  'Dumbbell Curl': {
    equipment: 'dumbbell',
    exerciseKey: 'curl',
    muscleGroup: 'Biceps',
    description: 'Dumbbell Curl'
  },
  'Hammer Curl': {
    equipment: 'dumbbell',
    exerciseKey: 'hammer-curl',
    muscleGroup: 'Biceps',
    description: 'Dumbbell Hammer Curl'
  },
  'Reverse Curl': {
    equipment: 'barbell',
    exerciseKey: 'reverse-curl',
    muscleGroup: 'Biceps',
    description: 'Reverse Barbell Curl'
  },
  'Machine Curl': {
    equipment: 'machine',
    exerciseKey: 'curl',
    muscleGroup: 'Biceps',
    description: 'Machine Curl'
  },
  'Cable Curl': {
    equipment: 'machine',
    exerciseKey: 'curl',
    muscleGroup: 'Biceps',
    description: 'Cable Curl'
  },
  'Preacher Curl': {
    equipment: 'barbell',
    exerciseKey: 'curl',
    muscleGroup: 'Biceps',
    description: 'Preacher Curl'
  },
  'Machine Preacher Curl': {
    equipment: 'machine',
    exerciseKey: 'curl',
    muscleGroup: 'Biceps',
    description: 'Machine Preacher Curl'
  },

  // Arm exercises - Triceps
  'Tricep Dips': {
    equipment: 'bodyweight',
    exerciseKey: 'dips',
    muscleGroup: 'Triceps',
    description: 'Tricep Dips - Bodyweight'
  },
  'Dips': {
    equipment: 'bodyweight',
    exerciseKey: 'dips',
    muscleGroup: 'Triceps',
    description: 'Dips - Bodyweight'
  },
  'Skullcrusher': {
    equipment: 'barbell',
    exerciseKey: 'skullcrusher',
    muscleGroup: 'Triceps',
    description: 'Barbell Skullcrusher'
  },
  'Laying Tricep Extensions': {
    equipment: 'barbell',
    exerciseKey: 'laying-tricep-extensions',
    muscleGroup: 'Triceps',
    description: 'Laying Tricep Extensions'
  },
  'Overhead Tricep Extension': {
    equipment: 'dumbbell',
    exerciseKey: 'overhead-tricep-extension',
    muscleGroup: 'Triceps',
    description: 'Dumbbell Overhead Tricep Extension'
  },
  'Tricep Extension': {
    equipment: 'dumbbell',
    exerciseKey: 'overhead-tricep-extension',
    muscleGroup: 'Triceps',
    description: 'Tricep Extension'
  },
  'Cable Tricep Extension': {
    equipment: 'machine',
    exerciseKey: 'overhead-tricep-extension',
    muscleGroup: 'Triceps',
    description: 'Cable Tricep Extension'
  },

  // Leg exercises - Quads
  'Squat': {
    equipment: 'bodyweight',
    exerciseKey: 'squat',
    muscleGroup: 'Quads',
    description: 'Bodyweight Squat'
  },
  'Barbell Squat': {
    equipment: 'barbell',
    exerciseKey: 'high-bar-squat',
    muscleGroup: 'Quads',
    description: 'Barbell Squat'
  },
  'High Bar Squat': {
    equipment: 'barbell',
    exerciseKey: 'high-bar-squat',
    muscleGroup: 'Quads',
    description: 'High Bar Squat'
  },
  'Goblet Squat': {
    equipment: 'dumbbell',
    exerciseKey: 'goblet-squat',
    muscleGroup: 'Quads',
    description: 'Dumbbell Goblet Squat'
  },
  'Machine Squat': {
    equipment: 'machine',
    exerciseKey: 'high-bar-squat',
    muscleGroup: 'Quads',
    description: 'Machine Squat'
  },
  'Leg Press': {
    equipment: 'machine',
    exerciseKey: 'goblet-squat',
    muscleGroup: 'Quads',
    description: 'Leg Press Machine'
  },
  'Machine Leg Press': {
    equipment: 'machine',
    exerciseKey: 'goblet-squat',
    muscleGroup: 'Quads',
    description: 'Machine Leg Press'
  },
  'Forward Lunge': {
    equipment: 'bodyweight',
    exerciseKey: 'forward-lunge',
    muscleGroup: 'Quads',
    description: 'Forward Lunge'
  },
  'Leg Extension': {
    equipment: 'machine',
    exerciseKey: 'high-bar-squat',
    muscleGroup: 'Quads',
    description: 'Leg Extension Machine'
  },
  'Machine Leg Extension': {
    equipment: 'machine',
    exerciseKey: 'high-bar-squat',
    muscleGroup: 'Quads',
    description: 'Machine Leg Extension'
  },
  'Bulgarian Split Squat': {
    equipment: 'bodyweight',
    exerciseKey: 'bulgarian-split-squat',
    muscleGroup: 'Quads',
    description: 'Bulgarian Split Squat'
  },

  // Leg exercises - Hamstrings
  'Deadlift': {
    equipment: 'barbell',
    exerciseKey: 'deadlift',
    muscleGroup: 'Hamstrings',
    description: 'Barbell Deadlift'
  },
  'Barbell Deadlift': {
    equipment: 'barbell',
    exerciseKey: 'deadlift',
    muscleGroup: 'Hamstrings',
    description: 'Barbell Deadlift'
  },
  'Sumo Deadlift': {
    equipment: 'barbell',
    exerciseKey: 'sumo-deadlift',
    muscleGroup: 'Hamstrings',
    description: 'Sumo Deadlift'
  },

  // Leg curl exercises
  'Leg Curl': {
    equipment: 'machine',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Hamstrings',
    description: 'Leg Curl Machine'
  },
  'Machine Leg Curl': {
    equipment: 'machine',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Hamstrings',
    description: 'Machine Leg Curl'
  },
  'Seated Leg Curl': {
    equipment: 'machine',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Hamstrings',
    description: 'Seated Leg Curl'
  },
  'Leg Curl Assis': {
    equipment: 'machine',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Hamstrings',
    description: 'Assisted Leg Curl'
  },
  'Leg curl assis': {
    equipment: 'machine',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Hamstrings',
    description: 'Assisted Leg Curl'
  },
  'Lying Leg Curl': {
    equipment: 'machine',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Hamstrings',
    description: 'Lying Leg Curl'
  },

  // Additional leg machines
  'Hip Abductor': {
    equipment: 'machine',
    exerciseKey: 'lateral-raise',
    muscleGroup: 'Glutes',
    description: 'Hip Abductor Machine'
  },
  'Machine Hip Abductor': {
    equipment: 'machine',
    exerciseKey: 'lateral-raise',
    muscleGroup: 'Glutes',
    description: 'Machine Hip Abductor'
  },
  'Hip Adductor': {
    equipment: 'machine',
    exerciseKey: 'row',
    muscleGroup: 'Glutes',
    description: 'Hip Adductor Machine'
  },
  'Machine Hip Adductor': {
    equipment: 'machine',
    exerciseKey: 'row',
    muscleGroup: 'Glutes',
    description: 'Machine Hip Adductor'
  },
  'Ab Machine': {
    equipment: 'machine',
    exerciseKey: 'crunch',
    muscleGroup: 'Abdominals',
    description: 'Ab Machine'
  },
  'Cable Crunch': {
    equipment: 'machine',
    exerciseKey: 'crunch',
    muscleGroup: 'Abdominals',
    description: 'Cable Crunch'
  },

  // Core exercises
  'Crunch': {
    equipment: 'bodyweight',
    exerciseKey: 'crunch',
    muscleGroup: 'Abdominals',
    description: 'Crunch'
  },
  'Leg Raises': {
    equipment: 'bodyweight',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Abdominals',
    description: 'Leg Raises'
  },
  'Leg Raise': {
    equipment: 'bodyweight',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Abdominals',
    description: 'Leg Raise'
  },
  'Forearm Plank': {
    equipment: 'bodyweight',
    exerciseKey: 'forearm-plank',
    muscleGroup: 'Abdominals',
    description: 'Forearm Plank'
  },
  'Plank': {
    equipment: 'bodyweight',
    exerciseKey: 'forearm-plank',
    muscleGroup: 'Abdominals',
    description: 'Plank'
  },
  'Russian Twist': {
    equipment: 'dumbbell',
    exerciseKey: 'russian-twist',
    muscleGroup: 'Obliques',
    description: 'Dumbbell Russian Twist'
  },

  // Glute exercises
  'Glute Bridge': {
    equipment: 'bodyweight',
    exerciseKey: 'glute-bridge',
    muscleGroup: 'Glutes',
    description: 'Glute Bridge'
  },

  // Calf exercises
  'Calf Raise': {
    equipment: 'bodyweight',
    exerciseKey: 'calf-raise',
    muscleGroup: 'Calves',
    description: 'Bodyweight Calf Raise'
  },
  'Barbell Calf Raise': {
    equipment: 'barbell',
    exerciseKey: 'calf-raise',
    muscleGroup: 'Calves',
    description: 'Barbell Calf Raise'
  },
  'Dumbbell Calf Raise': {
    equipment: 'dumbbell',
    exerciseKey: 'calf-raise',
    muscleGroup: 'Calves',
    description: 'Dumbbell Calf Raise'
  },

  // French exercise names (Noms d'exercices en français)
  'Presse à cuisses': {
    equipment: 'machine',
    exerciseKey: 'leg-press',
    muscleGroup: 'Quadriceps',
    description: 'Leg Press Machine'
  },
  'Presse à poitrine': {
    equipment: 'barbell',
    exerciseKey: 'bench-press',
    muscleGroup: 'Chest',
    description: 'Barbell Bench Press'
  },
  'Curl biceps': {
    equipment: 'barbell',
    exerciseKey: 'bicep-curl',
    muscleGroup: 'Biceps',
    description: 'Barbell Bicep Curl'
  },
  'Curl des biceps': {
    equipment: 'barbell',
    exerciseKey: 'bicep-curl',
    muscleGroup: 'Biceps',
    description: 'Barbell Bicep Curl'
  },
  'Curl haltères': {
    equipment: 'dumbbell',
    exerciseKey: 'bicep-curl',
    muscleGroup: 'Biceps',
    description: 'Dumbbell Bicep Curl'
  },
  'Triceps dips': {
    equipment: 'bodyweight',
    exerciseKey: 'tricep-dips',
    muscleGroup: 'Triceps',
    description: 'Tricep Dips'
  },
  'Développé haltères': {
    equipment: 'dumbbell',
    exerciseKey: 'dumbbell-bench-press',
    muscleGroup: 'Chest',
    description: 'Dumbbell Bench Press'
  },
  'Soulevé de terre': {
    equipment: 'barbell',
    exerciseKey: 'deadlift',
    muscleGroup: 'Back',
    description: 'Barbell Deadlift'
  },
  'Squat': {
    equipment: 'barbell',
    exerciseKey: 'squat',
    muscleGroup: 'Quadriceps',
    description: 'Barbell Squat'
  },
  'Squat barre': {
    equipment: 'barbell',
    exerciseKey: 'squat',
    muscleGroup: 'Quadriceps',
    description: 'Barbell Squat'
  },
  'Tirage horizontal': {
    equipment: 'barbell',
    exerciseKey: 'row',
    muscleGroup: 'Back',
    description: 'Barbell Row'
  },
  'Tirage horizontal assis': {
    equipment: 'machine',
    exerciseKey: 'seated-row',
    muscleGroup: 'Back',
    description: 'Seated Row Machine'
  },
  'Traction': {
    equipment: 'bodyweight',
    exerciseKey: 'pull-up',
    muscleGroup: 'Lats',
    description: 'Pull-up'
  },
  'Tractions': {
    equipment: 'bodyweight',
    exerciseKey: 'pull-up',
    muscleGroup: 'Lats',
    description: 'Pull-up'
  },
  'Développé épaules': {
    equipment: 'barbell',
    exerciseKey: 'overhead-press',
    muscleGroup: 'Shoulders',
    description: 'Barbell Overhead Press'
  },
  'Développé militaire': {
    equipment: 'barbell',
    exerciseKey: 'overhead-press',
    muscleGroup: 'Shoulders',
    description: 'Barbell Overhead Press'
  },
  'Échauffement': {
    equipment: 'bodyweight',
    exerciseKey: 'pushup',
    muscleGroup: 'Chest',
    description: 'Warm-up Exercise'
  },
  'Flexions': {
    equipment: 'bodyweight',
    exerciseKey: 'pushup',
    muscleGroup: 'Chest',
    description: 'Push-up'
  },
  'Flexion': {
    equipment: 'bodyweight',
    exerciseKey: 'pushup',
    muscleGroup: 'Chest',
    description: 'Push-up'
  },
  'Crunch': {
    equipment: 'bodyweight',
    exerciseKey: 'crunch',
    muscleGroup: 'Abs',
    description: 'Ab Crunch'
  },
  'Crunches': {
    equipment: 'bodyweight',
    exerciseKey: 'crunch',
    muscleGroup: 'Abs',
    description: 'Ab Crunch'
  },
  'Relevés de jambes': {
    equipment: 'bodyweight',
    exerciseKey: 'leg-raises',
    muscleGroup: 'Abs',
    description: 'Leg Raises'
  },
  'Extension jambes': {
    equipment: 'machine',
    exerciseKey: 'leg-extension',
    muscleGroup: 'Quadriceps',
    description: 'Leg Extension Machine'
  },
  'Flexion jambes': {
    equipment: 'machine',
    exerciseKey: 'leg-curl',
    muscleGroup: 'Hamstrings',
    description: 'Leg Curl Machine'
  },
  'Curl jambes assis': {
    equipment: 'machine',
    exerciseKey: 'leg-curl',
    muscleGroup: 'Hamstrings',
    description: 'Seated Leg Curl Machine'
  },
  'Abducteur hanche': {
    equipment: 'machine',
    exerciseKey: 'hip-abductor',
    muscleGroup: 'Abductors',
    description: 'Hip Abductor Machine'
  },
  'Adducteur hanche': {
    equipment: 'machine',
    exerciseKey: 'hip-adductor',
    muscleGroup: 'Adductors',
    description: 'Hip Adductor Machine'
  },
  'Relevé mollets': {
    equipment: 'bodyweight',
    exerciseKey: 'calf-raise',
    muscleGroup: 'Calves',
    description: 'Calf Raise'
  },
  'Relevé mollets barre': {
    equipment: 'barbell',
    exerciseKey: 'calf-raise',
    muscleGroup: 'Calves',
    description: 'Barbell Calf Raise'
  },
  'Extension torse': {
    equipment: 'bodyweight',
    exerciseKey: 'pushup',
    muscleGroup: 'Chest',
    description: 'Push-up'
  }
};

/**
 * Get exercise data from MuscleWiki
 * @param {string} exerciseName - The exercise name from the app
 * @param {string} gender - 'male' or 'female' (default: 'male')
 * @returns {object} Exercise data with image URLs or null if not found
 */
export function getMuscleWikiExercise(exerciseName, gender = 'male') {
  const mapping = exerciseMapping[exerciseName];

  if (!mapping) {
    console.warn(`Exercise not found in MuscleWiki mapping: ${exerciseName}`);
    return null;
  }

  const { equipment, exerciseKey, muscleGroup, description } = mapping;

  // Build image URLs
  const frontImageUrl = `${MUSCLEWIKI_BASE_URL}/${gender}-${equipment}-${exerciseKey}-front.gif`;
  const sideImageUrl = `${MUSCLEWIKI_BASE_URL}/${gender}-${equipment}-${exerciseKey}-side.gif`;

  return {
    name: exerciseName,
    description,
    muscleGroup,
    equipment,
    images: {
      front: frontImageUrl,
      side: sideImageUrl
    },
    fallbackImage: frontImageUrl,
    gender
  };
}

/**
 * Get all available exercises
 * @returns {array} Array of exercise names
 */
export function getAllExercises() {
  return Object.keys(exerciseMapping).sort();
}

/**
 * Get exercises by muscle group
 * @param {string} muscleGroup - The muscle group name
 * @returns {array} Array of exercise names
 */
export function getExercisesByMuscleGroup(muscleGroup) {
  return Object.entries(exerciseMapping)
    .filter(([_, data]) => data.muscleGroup === muscleGroup)
    .map(([name]) => name)
    .sort();
}

export default exerciseMapping;
