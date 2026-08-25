/**
 * Suite de pruebas unitarias para el Sistema de Emojis estilo Apple
 * Ejecutable vía: node --test tests/appleEmoji.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

const APPLE_EMOJI_CDN_BASE = 'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160';

const COMMON_EMOJI_HEX_MAP = {
  '🎯': '1f3af',
  '🌿': '1f33f',
  '💧': '1f4a7',
  '🧡': '1f9e1',
  '🍕': '1f355',
  '⚡': '26a1',
  '🏆': '1f3c6',
  '💎': '1f48e',
  '👑': '1f451',
  '🔥': '1f525',
  '✨': '2728',
  '👋': '1f44b',
  '🧖‍♂️': '1f9d6-200d-2642-fe0f',
};

function emojiToAppleHex(emoji) {
  if (!emoji) return '1f600';
  if (COMMON_EMOJI_HEX_MAP[emoji]) {
    return COMMON_EMOJI_HEX_MAP[emoji];
  }

  const codePoints = [];
  for (let i = 0; i < emoji.length; i++) {
    const code = emoji.codePointAt(i);
    if (code !== undefined) {
      codePoints.push(code.toString(16));
      if (code > 0xffff) {
        i++;
      }
    }
  }

  return codePoints.join('-');
}

function getAppleEmojiUrl(emoji) {
  const hex = emojiToAppleHex(emoji);
  return `${APPLE_EMOJI_CDN_BASE}/${hex}.png`;
}

const EMOJI_GLOBAL_REGEX = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu;

test('1. Conversión de Emojis Simples a Hex de Apple', () => {
  assert.equal(emojiToAppleHex('🎯'), '1f3af');
  assert.equal(emojiToAppleHex('🌿'), '1f33f');
  assert.equal(emojiToAppleHex('💧'), '1f4a7');
  assert.equal(emojiToAppleHex('⚡'), '26a1');
  assert.equal(emojiToAppleHex('🏆'), '1f3c6');
  assert.equal(emojiToAppleHex('💎'), '1f48e');
  assert.equal(emojiToAppleHex('🔥'), '1f525');
  assert.equal(emojiToAppleHex('👋'), '1f44b');
});

test('2. Conversión de Emojis con Secuencia ZWJ (Zero-Width Joiner)', () => {
  assert.equal(emojiToAppleHex('🧖‍♂️'), '1f9d6-200d-2642-fe0f');
});

test('3. Generación de URLs CDN de Alta Resolución (160x160)', () => {
  assert.equal(
    getAppleEmojiUrl('🎯'),
    'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160/1f3af.png'
  );
  assert.equal(
    getAppleEmojiUrl('👋'),
    'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160/1f44b.png'
  );
  assert.equal(
    getAppleEmojiUrl('💎'),
    'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160/1f48e.png'
  );
});

test('4. Detección de Emojis en Texto Mixto vía Regex Unicode', () => {
  const text1 = 'Hola, Alvaro 👋';
  const matches1 = text1.match(EMOJI_GLOBAL_REGEX);
  assert.deepEqual(matches1, ['👋']);

  const text2 = 'Estudiar para examen de UTN 🎯 y meditar 🧘';
  const matches2 = text2.match(EMOJI_GLOBAL_REGEX);
  assert.deepEqual(matches2, ['🎯', '🧘']);

  const text3 = 'Texto normal sin emojis';
  const matches3 = text3.match(EMOJI_GLOBAL_REGEX);
  assert.equal(matches3, null);
});
