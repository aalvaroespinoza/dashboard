import test from 'node:test';
import assert from 'node:assert/strict';

// Mock Intent Launcher and Platform
async function simulateHuaweiWeatherLaunch(platform, startActivityAsyncMock, fallbackCallback) {
  if (platform === 'android') {
    try {
      await startActivityAsyncMock('android.intent.action.MAIN', {
        packageName: 'com.huawei.android.totemweather',
        flags: 0x10000000,
      });
      return { status: 'launched' };
    } catch (err) {
      fallbackCallback?.();
      return { status: 'fallback_error', error: err };
    }
  } else {
    fallbackCallback?.();
    return { status: 'fallback_platform' };
  }
}

test('1. Disparo de Intent nativo Huawei Weather en Android con package com.huawei.android.totemweather', async () => {
  let capturedAction = null;
  let capturedOptions = null;

  const mockStartActivity = async (action, options) => {
    capturedAction = action;
    capturedOptions = options;
  };

  let fallbackCalled = false;
  const res = await simulateHuaweiWeatherLaunch('android', mockStartActivity, () => {
    fallbackCalled = true;
  });

  assert.equal(res.status, 'launched');
  assert.equal(capturedAction, 'android.intent.action.MAIN');
  assert.equal(capturedOptions.packageName, 'com.huawei.android.totemweather');
  assert.equal(capturedOptions.flags, 0x10000000);
  assert.equal(fallbackCalled, false);
});

test('2. Manejo silencioso de excepciones en caso de que la app de clima no esté instalada', async () => {
  const failingStartActivity = async () => {
    throw new Error('Activity not found: com.huawei.android.totemweather');
  };

  let fallbackCalled = false;
  const res = await simulateHuaweiWeatherLaunch('android', failingStartActivity, () => {
    fallbackCalled = true;
  });

  assert.equal(res.status, 'fallback_error');
  assert.equal(fallbackCalled, true);
});

test('3. En plataformas no Android invoca el modal de pronóstico en-app sin crashear', async () => {
  let fallbackCalled = false;
  const res = await simulateHuaweiWeatherLaunch('ios', async () => {}, () => {
    fallbackCalled = true;
  });

  assert.equal(res.status, 'fallback_platform');
  assert.equal(fallbackCalled, true);
});