/**
 * soundEffects.ts
 * Servicio de efectos de sonido y respuesta háptica nativa para MiHub.
 *
 * Utiliza expo-audio para iOS/Android y Web Audio API en Web,
 * complementado con retroalimentación háptica táctil de expo-haptics.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function uint8ToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;

    result += B64_CHARS.charAt(b0 >> 2);
    result += B64_CHARS.charAt(((b0 & 3) << 4) | (b1 >> 4));
    result += i + 1 < len ? B64_CHARS.charAt(((b1 & 15) << 2) | (b2 >> 6)) : '=';
    result += i + 2 < len ? B64_CHARS.charAt(b2 & 63) : '=';
  }
  return result;
}

let cachedChimeBase64: string = '';

function getChimeWavBase64(): string {
  if (cachedChimeBase64) return cachedChimeBase64;

  const sampleRate = 44100;
  const duration = 0.5; // 500ms
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header (PCM 16-bit Mono 44.1kHz)
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true);

  // Síntesis de acorde campanilla Apple (D5: 587.3Hz -> A5: 880Hz -> D6: 1174.6Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Tono 1 (D5): Inicio t=0
    if (t < 0.35) {
      const env1 = Math.exp(-t * 12);
      sample += 0.45 * Math.sin(2 * Math.PI * 587.33 * t) * env1;
    }

    // Tono 2 (A5): Inicio t=0.06
    if (t >= 0.06 && t < 0.45) {
      const t2 = t - 0.06;
      const env2 = Math.exp(-t2 * 9);
      sample += 0.55 * Math.sin(2 * Math.PI * 880.0 * t2) * env2;
    }

    // Tono 3 (D6): Inicio t=0.12
    if (t >= 0.12) {
      const t3 = t - 0.12;
      const env3 = Math.exp(-t3 * 7);
      sample += 0.65 * Math.sin(2 * Math.PI * 1174.66 * t3) * env3;
      // Armónico brillante
      sample += 0.2 * Math.sin(2 * Math.PI * 2349.32 * t3) * env3;
    }

    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  cachedChimeBase64 = uint8ToBase64(new Uint8Array(buffer));
  return cachedChimeBase64;
}

/**
 * Reproduce un sonido gratificante estilo campana Apple al completar un hábito o tarea.
 */
export async function playHabitCompleteSound(): Promise<void> {
  // 1. Feedback Háptico en dispositivos compatibles
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {
    // Ignorar si el dispositivo no soporta hápticos
  }

  // 2. Reproducción de Audio
  try {
    const base64Data = getChimeWavBase64();
    if (!base64Data) return;

    if (Platform.OS === 'web') {
      // Web Audio / HTML5 Audio
      const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
      audio.volume = 0.6;
      await audio.play().catch(() => {});
    } else {
      // Expo Audio nativo (SDK 57)
      try {
        const { createAudioPlayer } = require('expo-audio');
        const uri = `data:audio/wav;base64,${base64Data}`;
        const player = createAudioPlayer({ uri });
        if (player) {
          player.volume = 0.7;
          player.play();
          setTimeout(() => {
            try {
              player.release();
            } catch {}
          }, 1200);
        }
      } catch (err) {
        console.log('Error reproduciendo sonido nativo:', err);
      }
    }
  } catch (err) {
    console.log('Error al reproducir audio de hábito:', err);
  }
}
