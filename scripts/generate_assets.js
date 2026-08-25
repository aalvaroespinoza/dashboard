const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');

// Helper: clamp
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Helper: distance between two points
function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

// Segment SDF
function segmentSDF(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, ax, ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return dist(px, py, projX, projY);
}

// Rounded Box SDF (centered at 0,0)
function roundedBoxSDF(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const outsideDist = Math.hypot(ox, oy);
  const insideDist = Math.min(Math.max(qx, qy), 0);
  return outsideDist + insideDist - r;
}

// Color interpolation
function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
    c1[3] !== undefined && c2[3] !== undefined ? c1[3] + (c2[3] - c1[3]) * t : 1,
  ];
}

// Glyph multi-stop gradient (Indigo -> Electric Cyan)
// #6366F1 (99, 102, 241) -> #5E5CE6 (94, 92, 230) -> #0A84FF (10, 132, 255) -> #64D2FF (100, 210, 255)
function getGlyphColor(t) {
  t = clamp(t, 0, 1);
  if (t < 0.35) {
    return lerpColor([99, 102, 241, 1], [94, 92, 230, 1], t / 0.35);
  } else if (t < 0.75) {
    return lerpColor([94, 92, 230, 1], [10, 132, 255, 1], (t - 0.35) / 0.4);
  } else {
    return lerpColor([10, 132, 255, 1], [100, 210, 255, 1], (t - 0.75) / 0.25);
  }
}

// Render Master Image to PNG
function renderLogoPNG({ width, height, isForegroundOnly = false, isBackgroundOnly = false, scale = 1.0 }) {
  const png = new PNG({ width, height });

  // Coordenadas normalizadas a base 1000x1000
  const S = 1000;
  const halfS = S / 2;

  // Segmentos del Glifo M
  const segments = [
    // Pierna Izquierda
    { ax: 275, ay: 690, bx: 275, by: 410, w: 72 },
    // Arco Izquierdo
    { ax: 275, ay: 410, bx: 340, by: 320, w: 72 },
    { ax: 340, ay: 320, bx: 430, by: 320, w: 72 },
    { ax: 430, ay: 320, bx: 500, by: 388, w: 72 },
    // Conector Centro
    { ax: 500, ay: 388, bx: 500, by: 515, w: 62 },
    // Arco Derecho
    { ax: 500, ay: 388, bx: 570, by: 320, w: 72 },
    { ax: 570, ay: 320, bx: 660, by: 320, w: 72 },
    { ax: 660, ay: 320, bx: 725, by: 410, w: 72 },
    // Pierna Derecha
    { ax: 725, ay: 410, bx: 725, by: 690, w: 72 },
  ];

  const hubCx = 500;
  const hubCy = 590;
  const hubOuterR = 98;
  const hubOuterW = 36;
  const hubInnerR = 46;

  // Loop sobre cada pixel con 2x2 super-sampling
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let accumR = 0;
      let accumG = 0;
      let accumB = 0;
      let accumA = 0;

      const subSamples = [
        [0.25, 0.25],
        [0.75, 0.25],
        [0.25, 0.75],
        [0.75, 0.75],
      ];

      for (const [subX, subY] of subSamples) {
        // Mapear pixel a espacio 1000x1000 centrado con scale
        const pxNorm = ((x + subX) / width - 0.5) / scale * S + halfS;
        const pyNorm = ((y + subY) / height - 0.5) / scale * S + halfS;

        let sampleR = 0, sampleG = 0, sampleB = 0, sampleA = 0;

        if (isBackgroundOnly) {
          sampleR = 0; sampleG = 0; sampleB = 0; sampleA = 1;
        } else if (!isForegroundOnly) {
          // 1. Squircle Box SDF
          const boxHalf = 480;
          const boxRadius = 230;
          const boxDist = roundedBoxSDF(pxNorm - halfS, pyNorm - halfS, boxHalf, boxHalf, boxRadius);

          if (boxDist <= 0) {
            // Fondo degradado obsidiana #1C1C24 a #0B0B0E
            const bgT = clamp((pxNorm + pyNorm) / 2000, 0, 1);
            const bgCol = lerpColor([28, 28, 36], [11, 11, 14], bgT);
            sampleR = bgCol[0];
            sampleG = bgCol[1];
            sampleB = bgCol[2];
            sampleA = 1;

            // Ambient border glow (últimos 16px)
            if (boxDist > -16) {
              const borderT = (boxDist + 16) / 16;
              const borderAlpha = (1 - (pyNorm / S) * 0.7) * 0.45 * borderT;
              sampleR = Math.round(sampleR * (1 - borderAlpha) + 255 * borderAlpha);
              sampleG = Math.round(sampleG * (1 - borderAlpha) + 255 * borderAlpha);
              sampleB = Math.round(sampleB * (1 - borderAlpha) + 255 * borderAlpha);
            }

            // Resplandor difuso detrás del Hub
            const glowDist = dist(pxNorm, pyNorm, hubCx, hubCy);
            if (glowDist < 300) {
              const glowIntensity = Math.pow(1 - glowDist / 300, 2) * 0.35;
              sampleR = Math.min(255, Math.round(sampleR + 100 * glowIntensity));
              sampleG = Math.min(255, Math.round(sampleG + 210 * glowIntensity));
              sampleB = Math.min(255, Math.round(sampleB + 255 * glowIntensity));
            }
          } else if (boxDist < 1.5) {
            // Anti-aliasing del borde exterior del Squircle
            const alpha = 1 - boxDist / 1.5;
            sampleR = 28; sampleG = 28; sampleB = 36;
            sampleA = alpha;
          }
        }

        // 2. Glifo Geométrico M (si no es sólo background)
        if (!isBackgroundOnly) {
          // Evaluar distancia a segmentos M
          let minMDist = 9999;
          let bestT = 0;

          for (const seg of segments) {
            const d = segmentSDF(pxNorm, pyNorm, seg.ax, seg.ay, seg.bx, seg.by) - seg.w / 2;
            if (d < minMDist) {
              minMDist = d;
              bestT = clamp(((pxNorm - 275) / (725 - 275) + (1 - pyNorm / S)) / 2, 0, 1);
            }
          }

          // Dibujar Glifo M
          if (minMDist <= 0) {
            const gCol = getGlyphColor(bestT);
            sampleR = gCol[0];
            sampleG = gCol[1];
            sampleB = gCol[2];
            sampleA = 1;
          } else if (minMDist < 2.0) {
            const edgeAlpha = 1 - minMDist / 2.0;
            const gCol = getGlyphColor(bestT);
            sampleR = Math.round(sampleR * (1 - edgeAlpha) + gCol[0] * edgeAlpha);
            sampleG = Math.round(sampleG * (1 - edgeAlpha) + gCol[1] * edgeAlpha);
            sampleB = Math.round(sampleB * (1 - edgeAlpha) + gCol[2] * edgeAlpha);
            sampleA = Math.max(sampleA, edgeAlpha);
          }

          // 3. Núcleo Hub Exterior (Anillo)
          const hubDist = dist(pxNorm, pyNorm, hubCx, hubCy);
          const ringDist = Math.abs(hubDist - (hubOuterR - hubOuterW / 2)) - hubOuterW / 2;

          if (ringDist <= 0) {
            const gCol = getGlyphColor(0.85);
            sampleR = gCol[0];
            sampleG = gCol[1];
            sampleB = gCol[2];
            sampleA = 1;
          } else if (ringDist < 2.0) {
            const edgeAlpha = 1 - ringDist / 2.0;
            const gCol = getGlyphColor(0.85);
            sampleR = Math.round(sampleR * (1 - edgeAlpha) + gCol[0] * edgeAlpha);
            sampleG = Math.round(sampleG * (1 - edgeAlpha) + gCol[1] * edgeAlpha);
            sampleB = Math.round(sampleB * (1 - edgeAlpha) + gCol[2] * edgeAlpha);
            sampleA = Math.max(sampleA, edgeAlpha);
          }

          // Interior del Hub (negro / obsidiana)
          if (hubDist < hubOuterR - hubOuterW) {
            sampleR = 18; sampleG = 18; sampleB = 22;
            sampleA = Math.max(sampleA, isForegroundOnly ? 1 : sampleA);
          }

          // 4. Centro Luminous del Hub Core (#64D2FF -> #00F5D4)
          const coreDist = hubDist - hubInnerR;
          if (coreDist <= 0) {
            const coreT = clamp((pxNorm - (hubCx - hubInnerR)) / (hubInnerR * 2), 0, 1);
            const coreCol = lerpColor([100, 210, 255], [0, 245, 212], coreT);
            sampleR = coreCol[0];
            sampleG = coreCol[1];
            sampleB = coreCol[2];
            sampleA = 1;
          } else if (coreDist < 2.0) {
            const edgeAlpha = 1 - coreDist / 2.0;
            const coreCol = [100, 210, 255];
            sampleR = Math.round(sampleR * (1 - edgeAlpha) + coreCol[0] * edgeAlpha);
            sampleG = Math.round(sampleG * (1 - edgeAlpha) + coreCol[1] * edgeAlpha);
            sampleB = Math.round(sampleB * (1 - edgeAlpha) + coreCol[2] * edgeAlpha);
            sampleA = Math.max(sampleA, edgeAlpha);
          }
        }

        accumR += sampleR;
        accumG += sampleG;
        accumB += sampleB;
        accumA += sampleA;
      }

      const idx = (y * width + x) * 4;
      png.data[idx] = Math.round(accumR / 4);
      png.data[idx + 1] = Math.round(accumG / 4);
      png.data[idx + 2] = Math.round(accumB / 4);
      png.data[idx + 3] = Math.round((accumA / 4) * 255);
    }
  }

  return PNG.sync.write(png);
}

function run() {
  console.log('Generating high-resolution MiHub brand assets...');

  // 1. icon.png (1024x1024)
  const iconBuffer = renderLogoPNG({ width: 1024, height: 1024, scale: 0.98 });
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuffer);
  console.log('✔ icon.png (1024x1024)');

  // 2. splash-icon.png (512x512)
  const splashBuffer = renderLogoPNG({ width: 512, height: 512, scale: 0.98 });
  fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), splashBuffer);
  console.log('✔ splash-icon.png (512x512)');

  // 3. android-icon-foreground.png (432x432, safe-zone scale 0.65)
  const fgBuffer = renderLogoPNG({ width: 432, height: 432, isForegroundOnly: true, scale: 0.66 });
  fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), fgBuffer);
  fs.writeFileSync(path.join(assetsDir, 'android-icon-monochrome.png'), fgBuffer);
  console.log('✔ android-icon-foreground.png & monochrome (432x432)');

  // 4. android-icon-background.png (432x432, pure black)
  const bgBuffer = renderLogoPNG({ width: 432, height: 432, isBackgroundOnly: true });
  fs.writeFileSync(path.join(assetsDir, 'android-icon-background.png'), bgBuffer);
  console.log('✔ android-icon-background.png (432x432)');

  // 5. adaptive-icon.png (432x432)
  const adaptBuffer = renderLogoPNG({ width: 432, height: 432, scale: 0.98 });
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptBuffer);
  console.log('✔ adaptive-icon.png (432x432)');

  // 6. favicon.png (64x64)
  const favBuffer = renderLogoPNG({ width: 64, height: 64, scale: 0.98 });
  fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favBuffer);
  console.log('✔ favicon.png (64x64)');

  console.log('\nAll brand PNG assets generated and saved successfully!');
}

run();
