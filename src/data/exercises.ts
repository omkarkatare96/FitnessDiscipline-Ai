export interface ExerciseMedia {
  name: string;
  muscleGroup: string;
  description: string;
  sets: number;
  reps: number;
  mediaType: "image" | "gif" | "video";
  mediaUrl: string;
}

// YouTube embed IDs for video type
// GIF URLs sourced from Giphy fitness collection
// Image URLs from Unsplash

export const exerciseMediaDB: Record<string, ExerciseMedia> = {
  // ── CHEST ──────────────────────────────────────────────────────────────────
  "Push-Ups": {
    name: "Push-Ups",
    muscleGroup: "Chest",
    description: "Classic bodyweight push-up targeting the entire chest, triceps and anterior deltoid.",
    sets: 3, reps: 15,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGcza3E4cDBia3lnZGo0OGdiaHZ2MGc3cTI4cGUxMGF4eWZ0MjF2ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5t9IcXiBCthqEpCWAF/giphy.gif",
  },
  "Incline Push-Ups": {
    name: "Incline Push-Ups",
    muscleGroup: "Chest",
    description: "Hands elevated on a bench/box. Focuses on the lower chest and is perfect for beginners.",
    sets: 3, reps: 12,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a64?w=600&q=80",
  },
  "Barbell Bench Press": {
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    description: "King of chest exercises. Flat barbell press activating all three heads of the pecs.",
    sets: 4, reps: 10,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
  },
  "Dumbbell Incline Press": {
    name: "Dumbbell Incline Press",
    muscleGroup: "Chest",
    description: "30–45° incline isolates the upper chest. Full range of motion is key.",
    sets: 4, reps: 10,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=600&q=80",
  },
  "Heavy Bench Press": {
    name: "Heavy Bench Press",
    muscleGroup: "Chest",
    description: "85–90% 1RM powerlifting bench. Requires a spotter. Maximum hypertrophy and strength.",
    sets: 5, reps: 5,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/vcBig73ojpE",
  },
  "Cable Flyes": {
    name: "Cable Flyes",
    muscleGroup: "Chest",
    description: "Constant tension through the full arc of motion. Great for chest isolation and peak contraction.",
    sets: 3, reps: 12,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXJhNzZla3dxeGNrYjQwaHJxenJpNGt0eTN5dWt3cGJoYWtvbWc5NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPrEihCo3LDRhna/giphy.gif",
  },

  // ── BACK ───────────────────────────────────────────────────────────────────
  "Pull-Ups": {
    name: "Pull-Ups",
    muscleGroup: "Back",
    description: "Best back builder with bodyweight. Targets the lats, biceps, and rear delts.",
    sets: 3, reps: 8,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzF2d2J3c21zY3RvaGh2NXQzNHpxaHRyd3dtNHVqczY3bXVqb3h5eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9IgG7phFgFMDRBZu/giphy.gif",
  },
  "Barbell Row": {
    name: "Barbell Row",
    muscleGroup: "Back",
    description: "Bent-over barbell row is the compound movement for a thick, powerful back.",
    sets: 4, reps: 8,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/G8l_8chR5BE",
  },
  "Lat Pulldown": {
    name: "Lat Pulldown",
    muscleGroup: "Back",
    description: "Cable machine pull-down focusing on lat engagement and scapular depression.",
    sets: 4, reps: 12,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW50em9oYzYxbXd0Z3IyaW16OWhxeWdveWNlbGlpc3NwZXUwZHgxbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DpZLBLHxcSNuHbWCiZ/giphy.gif",
  },
  "Deadlift": {
    name: "Deadlift",
    muscleGroup: "Back",
    description: "The ultimate posterior chain builder. Hamstrings, glutes, spinal erectors and traps.",
    sets: 4, reps: 5,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/op9kVnSso6Q",
  },

  // ── SHOULDERS ──────────────────────────────────────────────────────────────
  "Overhead Press": {
    name: "Overhead Press",
    muscleGroup: "Shoulders",
    description: "Standing barbell OHP. Primary deltoid builder, also works triceps and upper chest.",
    sets: 4, reps: 8,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
  },
  "Dumbbell Lateral Raise": {
    name: "Dumbbell Lateral Raise",
    muscleGroup: "Shoulders",
    description: "Isolates the medial (side) deltoid for wide, capped shoulder development.",
    sets: 3, reps: 15,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW9veXpwZ2ZnYmtudmk4cjE2ZGVmenViNXBkMjdsZW9kc3NobDQ3ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5t9wJjyHAOxvnxcPNk/giphy.gif",
  },
  "Face Pulls": {
    name: "Face Pulls",
    muscleGroup: "Shoulders",
    description: "Cable face pull for rear deltoid and rotator cuff health. Essential for shoulder longevity.",
    sets: 3, reps: 15,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1596357395217-80de13130e92?w=600&q=80",
  },

  // ── BICEPS ─────────────────────────────────────────────────────────────────
  "Barbell Curl": {
    name: "Barbell Curl",
    muscleGroup: "Biceps",
    description: "Standard barbell curl focuses maximum load on the bicep brachii and brachialis.",
    sets: 4, reps: 10,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHdkMGszZmN3bXZwampsZ3UzN3R5N3d0dXM5MDFobml5NnF0aW56MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9G3wg7lH5DpxC/giphy.gif",
  },
  "Hammer Curl": {
    name: "Hammer Curl",
    muscleGroup: "Biceps",
    description: "Neutral grip curl targeting the brachialis and brachioradialis for arm thickness.",
    sets: 3, reps: 12,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80",
  },
  "Incline Dumbbell Curl": {
    name: "Incline Dumbbell Curl",
    muscleGroup: "Biceps",
    description: "On an incline bench for a full stretch at the bottom, maximizing long-head activation.",
    sets: 3, reps: 10,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  },

  // ── TRICEPS ────────────────────────────────────────────────────────────────
  "Tricep Dips": {
    name: "Tricep Dips",
    muscleGroup: "Triceps",
    description: "Bodyweight or weighted dips. Keep torso upright to maximise tricep engagement.",
    sets: 3, reps: 10,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExendnaTN5d3ZlNXd5Z3AycjlhNzN3NWE3azl5OW1xdHIxNmtleWJmbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13HBDT4QSTpveU/giphy.gif",
  },
  "Skull Crushers": {
    name: "Skull Crushers",
    muscleGroup: "Triceps",
    description: "EZ-bar lying tricep extension. Direct long-head isolation. Lower slowly.",
    sets: 4, reps: 10,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/d_KZxkY_0cM",
  },
  "Pushdown": {
    name: "Pushdown",
    muscleGroup: "Triceps",
    description: "Cable rope or bar pushdown for maximum pump and isolation of all three tricep heads.",
    sets: 3, reps: 15,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=600&q=80",
  },

  // ── LEGS ───────────────────────────────────────────────────────────────────
  "Barbell Squat": {
    name: "Barbell Squat",
    muscleGroup: "Legs",
    description: "King of all exercises. Full quad, glute and hamstring activation. Break parallel.",
    sets: 5, reps: 5,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
  },
  "Romanian Deadlift": {
    name: "Romanian Deadlift",
    muscleGroup: "Legs",
    description: "Hip hinge focusing on hamstring stretch and glute activation. Soft knee bend.",
    sets: 4, reps: 10,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejd1MnQ0Z3N2bXlzZjlkY2V3dGRseGVoNDdrN2pnM2g2NHlmMHBoNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Zt9ClHiHVUxoMxi/giphy.gif",
  },
  "Lunges": {
    name: "Lunges",
    muscleGroup: "Legs",
    description: "Alternating lunges for unilateral leg development, balance and glute activation.",
    sets: 3, reps: 12,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnRvN3pvY3UwcHB4aHljeDhqZWk4a2NsajkyZXV0dXJsZW5xa3ZuNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlFPNndZgxIHMpi/giphy.gif",
  },

  // ── CORE ───────────────────────────────────────────────────────────────────
  "Plank": {
    name: "Plank",
    muscleGroup: "Core",
    description: "Full-body isometric hold. Brace every muscle tight. No sagging or piking.",
    sets: 3, reps: 45,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXo3emticGJ0bHlhNHBmbnZweGxkd2Y0bW0wb3VlZnpleGhsanpuYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2JJKs3I69qfaQleE/giphy.gif",
  },
  "Hanging Leg Raise": {
    name: "Hanging Leg Raise",
    muscleGroup: "Core",
    description: "Hang from a bar and raise straight legs to hip height. Targets lower abs.",
    sets: 3, reps: 12,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/Pr1ieGZ5atk",
  },
  "Ab Wheel Rollout": {
    name: "Ab Wheel Rollout",
    muscleGroup: "Core",
    description: "Advanced core exercise with full anterior core engagement and lat involvement.",
    sets: 3, reps: 10,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  },

  // ── FULL BODY ──────────────────────────────────────────────────────────────
  "Burpees": {
    name: "Burpees",
    muscleGroup: "Full Body",
    description: "Full-body cardio and strength combo. Explosive, challenging and burns massive calories.",
    sets: 3, reps: 15,
    mediaType: "gif",
    mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGdzdGdtNmR2ZWFtb2V3Z3V0MHZwNnU1Mnk3MjkybzMwN3g0azhrdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/23hPPMRcSHCDu/giphy.gif",
  },
  "Kettlebell Swing": {
    name: "Kettlebell Swing",
    muscleGroup: "Full Body",
    description: "Explosive hip hinge with kettlebell. Targets posterior chain, core and cardio capacity.",
    sets: 4, reps: 15,
    mediaType: "video",
    mediaUrl: "https://www.youtube.com/embed/YSxHifyI6s8",
  },
  "Clean and Press": {
    name: "Clean and Press",
    muscleGroup: "Full Body",
    description: "Olympic lift combining a power clean into an overhead press. Total body power.",
    sets: 4, reps: 6,
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&q=80",
  },
};

/** Get media data for an exercise by name, returns undefined if not in dataset */
export function getExerciseMedia(name: string): ExerciseMedia | undefined {
  return exerciseMediaDB[name];
}
