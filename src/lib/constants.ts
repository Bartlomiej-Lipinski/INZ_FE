export const IMAGES = {
  MATES_LOGO: "/mates.png",
} as const; 

export const STORAGE_KEYS = {
  SELECTED_GROUP_MEMBER: "selectedGroupMember",
} as const;


export const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;
export const ALLOWED_PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const SAFE_AVATAR_URL_PATTERN = /^(?:https?:\/\/|data:|blob:)/i;


export const STATUS_OPTIONS = [
  { value: "happy", label: "😊 Szczęśliwy/a" },
  { value: "relaxed", label: "😌 Zrelaksowany/a" },
  { value: "excited", label: "😃 Podekscytowany/a" },
  { value: "good_mood", label: "🙂 W dobrym nastroju" },
  { value: "chill", label: "😎 Wyluzowany/a" },
  { value: "motivated", label: "💪 Zmotywowany/a" },
  { value: "energetic", label: "🤩 Pełen/na energii" },
  { value: "neutral", label: "😐 Neutralnie" },
  { value: "no_mood", label: "😶 Bez konkretnego nastroju" },
  { value: "tired", label: "😴 Zmęczony/a" },
  { value: "break", label: "☕ Potrzebuję przerwy" },
  { value: "confused", label: "😕 Zagubiony/a" },
  { value: "sad", label: "😔 Smutny/a" },
  { value: "irritated", label: "😒 Podirytowany/a" },
  { value: "worried", label: "😟 Zmartwiony/a" },
  { value: "exhausted", label: "😴 Wykończony/a" },
  { value: "sick", label: "🤒 Chory/a" },
  { value: "focused", label: "📚 Skupiony/a" },
  { value: "music", label: "🎧 W muzycznym klimacie" },
  { value: "drama", label: "🍿 Czekam na dramę" },
  { value: "gaming", label: "🎮 W trybie gracza" },
  { value: "on_the_go", label: "🚶 W trasie" },
  { value: "zen", label: "🧘 W trybie chill" },
];

export const getStatusLabel = (statusValue: string | null | undefined): string => {
  if (!statusValue || statusValue.trim() === "") return "Brak statusu";
  const option = STATUS_OPTIONS.find(opt => opt.value === statusValue);
  return option ? option.label : statusValue;
};

