/**
 * Suite de pruebas unitarias para la Paleta de Colores Semánticos Apple HIG
 * Ejecutable vía: node --test tests/appleHIGPalette.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

const APPLE_ACCENT = {
  blue: { light: '#007AFF', dark: '#0A84FF' },
  red: { light: '#FF3B30', dark: '#FF453A' },
  green: { light: '#34C759', dark: '#30D158' },
  orange: { light: '#FF9500', dark: '#FF9F0A' },
  yellow: { light: '#FFCC00', dark: '#FFD60A' },
  purple: { light: '#AF52DE', dark: '#BF5AF2' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
  teal: { light: '#30B0C7', dark: '#40C8E0' },
  indigo: { light: '#5856D6', dark: '#5E5CE6' },
  mint: { light: '#00C7BE', dark: '#63E6E2' },
  cyan: { light: '#32ADE6', dark: '#64D2FF' },
};

function getAppleAccent(name, isDark = true) {
  const colorObj = APPLE_ACCENT[name] || APPLE_ACCENT.blue;
  return isDark ? colorObj.dark : colorObj.light;
}

function getTintStyle(color, isDark = true, opacity = 0.15) {
  let bg = `rgba(0, 122, 255, ${opacity})`;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      bg = `rgba(${r}, ${g}, ${b}, ${isDark ? opacity + 0.03 : opacity})`;
    }
  }
  return { backgroundColor: bg, color };
}

test('1. Resolución de los 11 Acentos Semánticos Oficiales Apple (Light vs Dark)', () => {
  // System Blue
  assert.equal(getAppleAccent('blue', false), '#007AFF');
  assert.equal(getAppleAccent('blue', true), '#0A84FF');

  // System Red
  assert.equal(getAppleAccent('red', false), '#FF3B30');
  assert.equal(getAppleAccent('red', true), '#FF453A');

  // System Green
  assert.equal(getAppleAccent('green', false), '#34C759');
  assert.equal(getAppleAccent('green', true), '#30D158');

  // System Orange
  assert.equal(getAppleAccent('orange', false), '#FF9500');
  assert.equal(getAppleAccent('orange', true), '#FF9F0A');

  // System Yellow
  assert.equal(getAppleAccent('yellow', false), '#FFCC00');
  assert.equal(getAppleAccent('yellow', true), '#FFD60A');

  // System Purple
  assert.equal(getAppleAccent('purple', false), '#AF52DE');
  assert.equal(getAppleAccent('purple', true), '#BF5AF2');

  // System Pink
  assert.equal(getAppleAccent('pink', false), '#FF2D55');
  assert.equal(getAppleAccent('pink', true), '#FF375F');

  // System Teal
  assert.equal(getAppleAccent('teal', false), '#30B0C7');
  assert.equal(getAppleAccent('teal', true), '#40C8E0');

  // System Indigo
  assert.equal(getAppleAccent('indigo', false), '#5856D6');
  assert.equal(getAppleAccent('indigo', true), '#5E5CE6');

  // System Mint
  assert.equal(getAppleAccent('mint', false), '#00C7BE');
  assert.equal(getAppleAccent('mint', true), '#63E6E2');

  // System Cyan
  assert.equal(getAppleAccent('cyan', false), '#32ADE6');
  assert.equal(getAppleAccent('cyan', true), '#64D2FF');
});

test('2. Generación de Tinted Pills / Glass a 15% de opacidad adaptativa', () => {
  const blueTintLight = getTintStyle('#007AFF', false, 0.15);
  assert.equal(blueTintLight.backgroundColor, 'rgba(0, 122, 255, 0.15)');
  assert.equal(blueTintLight.color, '#007AFF');

  const redTintDark = getTintStyle('#FF453A', true, 0.15);
  assert.equal(redTintDark.backgroundColor, 'rgba(255, 69, 58, 0.18)');
  assert.equal(redTintDark.color, '#FF453A');
});
