/**
 * Utilidades para resolución de Emojis estilo Apple (Apple Color Emoji)
 * con conversión Unicode a Hex y CDN global de alta resolución (160x160 PNG)
 */

export const APPLE_EMOJI_CDN_BASE = 'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160';

// Mapeo directo optimizado para emojis de alta frecuencia en la app
const COMMON_EMOJI_HEX_MAP: Record<string, string> = {
  '🎯': '1f3af',
  '🌿': '1f33f',
  '💧': '1f4a7',
  '🧡': '1f9e1',
  '🍕': '1f355',
  '⚡': '26a1',
  '🏆': '1f3c6',
  '🥇': '1f947',
  '🥈': '1f948',
  '🥉': '1f949',
  '💎': '1f48e',
  '👑': '1f451',
  '🔥': '1f525',
  '✨': '2728',
  '👋': '1f44b',
  '🧘‍♂️': '1f9d8-200d-2642-fe0f',
  '🧘': '1f9d8',
  '🧖‍♂️': '1f9d6-200d-2642-fe0f',
  '🏃‍♂️': '1f3c3-200d-2642-fe0f',
  '🚴‍♂️': '1f6b4-200d-2642-fe0f',
  '💪': '1f4aa',
  '🏊‍♂️': '1f3ca-200d-2642-fe0f',
  '🥗': '1f957',
  '🍎': '1f34e',
  '☕': '2615',
  '📚': '1f4da',
  '💻': '1f4bb',
  '🧠': '1f9e0',
  '✍️': '270d-fe0f',
  '🔬': '1f52c',
  '💡': '1f4a1',
  '🧹': '1f9f9',
  '🚿': '1f6bf',
  '🌅': '1f305',
  '🌙': '1f319',
  '🪥': '1faa5',
  '📖': '1f4d6',
  '🐶': '1f436',
  '🍿': '1f37f',
  '🎉': '1f389',
  '☀️': '2600-fe0f',
  '🌱': '1f331',
  '🛡️': '1f6e1-fe0f',
  '⚔️': '2694-fe0f',
  '🔮': '1f52e',
  '🥊': '1f94a',
  '🏀': '1f3c0',
  '🎾': '1f3be',
  '🚌': '1f68c',
  '✈️': '2708-fe0f',
  '🚗': '1f697',
  '🏠': '1f3e0',
  '💰': '1f4b0',
  '💳': '1f4b3',
  '🏷️': '1f3f7-fe0f',
  '📅': '1f4c5',
  '🕒': '1f552',
  '🔔': '1f514',
  '❤️': '2764-fe0f',
  '😀': '1f600',
  '😎': '1f60e',
};

/**
 * Convierte cualquier caracter o secuencia Unicode Emoji a su código hexadecimal
 */
export function emojiToAppleHex(emoji: string): string {
  if (!emoji) return '1f600';

  // 1. Comprobar caché rápido
  if (COMMON_EMOJI_HEX_MAP[emoji]) {
    return COMMON_EMOJI_HEX_MAP[emoji];
  }

  // 2. Conversión por CodePoints
  const codePoints: string[] = [];
  for (let i = 0; i < emoji.length; i++) {
    const code = emoji.codePointAt(i);
    if (code !== undefined) {
      codePoints.push(code.toString(16));
      if (code > 0xffff) {
        i++; // Saltar el segundo surrogate pair
      }
    }
  }

  // Normalizar secuencias
  const hex = codePoints.join('-');
  COMMON_EMOJI_HEX_MAP[emoji] = hex;
  return hex;
}

/**
 * Retorna la URL de imagen PNG de alta fidelidad Apple para el emoji
 */
export function getAppleEmojiUrl(emoji: string): string {
  const hex = emojiToAppleHex(emoji);
  return `${APPLE_EMOJI_CDN_BASE}/${hex}.png`;
}

/**
 * Expresión Regular para detectar emojis Unicode en cadenas de texto
 */
export const EMOJI_REGEX = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
export const EMOJI_GLOBAL_REGEX = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu;

/**
 * Categorías completas de Emojis de Apple para el Selector Pro
 */
export const APPLE_EMOJI_CATEGORIES = [
  {
    id: 'frequently_used',
    title: 'Frecuentes',
    icon: '🕒',
    emojis: ['🎯', '🌿', '💧', '⚡', '🏆', '🔥', '📚', '💪', '🍎', '💻', '💎', '👑'],
  },
  {
    id: 'activity_focus',
    title: 'Actividad & Foco',
    icon: '🎯',
    emojis: [
      '🎯', '🏆', '🥇', '🥈', '🥉', '💎', '👑', '⚡', '🔥', '✨',
      '🥊', '🏀', '⚽', '🎾', '🚴‍♂️', '🏃‍♂️', '🏋️‍♂️', '🏊‍♂️', '🧘‍♂️', '🧗‍♂️',
    ],
  },
  {
    id: 'mind_study',
    title: 'Mente & Estudio',
    icon: '📚',
    emojis: [
      '📚', '💻', '🧠', '✍️', '🔬', '💡', '📖', '📝', '🎨', '🎧',
      '🎓', '📐', '📊', '🔍', '⚙️', '📈', '🔭', '🗂️', '💼', '📌',
    ],
  },
  {
    id: 'health_wellness',
    title: 'Salud & Bienestar',
    icon: '🌿',
    emojis: [
      '🌿', '💧', '🧖‍♂️', '🥗', '🍎', '🥑', '🍌', '🍵', '🚿', '🪥',
      '🌙', '🌅', '☀️', '🌱', '🧹', '🛌', '🧘', '🧘‍♀️', '🥦', '🍉',
    ],
  },
  {
    id: 'social_fun',
    title: 'Social & Vínculos',
    icon: '🧡',
    emojis: [
      '🧡', '❤️', '🍕', '☕', '🍿', '🎉', '🐶', '🐱', '🎸', '🎮',
      '🍔', '🍦', '🍩', '🍻', '🍷', '🥂', '🎭', '🎬', '🎤', '🎲',
    ],
  },
  {
    id: 'objects_finance',
    title: 'Objetos & Finanzas',
    icon: '💰',
    emojis: [
      '💰', '💳', '💵', '🏷️', '📅', '🕒', '🔔', '🛡️', '⚔️', '🔮',
      '🔑', '🔒', '📱', '🔋', '📦', '🎁', '🛒', '🎫', '✈️', '🚌',
    ],
  },
];
