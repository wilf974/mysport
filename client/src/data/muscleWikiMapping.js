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
  'Forward Lunge': {
    equipment: 'bodyweight',
    exerciseKey: 'forward-lunge',
    muscleGroup: 'Quads',
    description: 'Forward Lunge'
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
