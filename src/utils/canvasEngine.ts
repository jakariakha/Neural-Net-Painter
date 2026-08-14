import { RobotArmConfig } from '../types';

export interface Point {
  x: number;
  y: number;
}

// Calculate 2-Joint Robotic Arm Inverse Kinematics
export function computeRobotArmJoints(
  base: Point,
  target: Point,
  l1: number = 140,
  l2: number = 120
) {
  const dx = target.x - base.x;
  const dy = target.y - base.y;
  const distance = Math.min(Math.hypot(dx, dy), l1 + l2 - 2);

  const angleToTarget = Math.atan2(dy, dx);
  // Law of Cosines for elbow angle
  const cosElbow = (distance * distance - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  const clampedCosElbow = Math.max(-1, Math.min(1, cosElbow));
  const elbowAngleRelative = Math.acos(clampedCosElbow);

  // Law of Cosines for shoulder angle addition
  const cosShoulder = (distance * distance + l1 * l1 - l2 * l2) / (2 * distance * l1);
  const clampedCosShoulder = Math.max(-1, Math.min(1, cosShoulder));
  const shoulderAngleOffset = Math.acos(clampedCosShoulder);

  const shoulderAngle = angleToTarget - shoulderAngleOffset;
  const elbowJoint = {
    x: base.x + l1 * Math.cos(shoulderAngle),
    y: base.y + l1 * Math.sin(shoulderAngle),
  };

  const wristAngle = shoulderAngle + elbowAngleRelative;
  const wristJoint = {
    x: elbowJoint.x + l2 * Math.cos(wristAngle),
    y: elbowJoint.y + l2 * Math.sin(wristAngle),
  };

  return {
    base,
    elbow: elbowJoint,
    wrist: wristJoint,
    target,
    shoulderAngleRad: shoulderAngle,
    elbowAngleRad: elbowAngleRelative,
  };
}

// Canvas Convolution Filters (Client-side CNN Feature Map simulation)
export function applySobelEdgeFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): ImageData {
  const src = ctx.getImageData(0, 0, width, height);
  const srcData = src.data;
  const output = ctx.createImageData(width, height);
  const outData = output.data;

  // Sobel kernels
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0;
      let pixelY = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const kIdx = (ky + 1) * 3 + (kx + 1);
          // Grayscale intensity
          const intensity =
            0.299 * srcData[idx] + 0.587 * srcData[idx + 1] + 0.114 * srcData[idx + 2];

          pixelX += intensity * gx[kIdx];
          pixelY += intensity * gy[kIdx];
        }
      }

      const magnitude = Math.min(255, Math.hypot(pixelX, pixelY));
      const outIdx = (y * width + x) * 4;
      outData[outIdx] = magnitude;     // R
      outData[outIdx + 1] = magnitude; // G
      outData[outIdx + 2] = magnitude; // B
      outData[outIdx + 3] = 255;       // A
    }
  }

  return output;
}

// High-Pass / Gram Matrix Texture Filter
export function applyGramTextureFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  styleIntensity: number = 0.8
): ImageData {
  const src = ctx.getImageData(0, 0, width, height);
  const srcData = src.data;
  const output = ctx.createImageData(width, height);
  const outData = output.data;

  for (let i = 0; i < srcData.length; i += 4) {
    const r = srcData[i];
    const g = srcData[i + 1];
    const b = srcData[i + 2];

    // High frequency texture boost and color distortion simulation
    const avg = (r + g + b) / 3;
    const highFreqR = Math.min(255, Math.max(0, r + (r - avg) * styleIntensity * 1.5));
    const highFreqG = Math.min(255, Math.max(0, g + (g - avg) * styleIntensity * 1.2));
    const highFreqB = Math.min(255, Math.max(0, b + (b - avg) * styleIntensity * 1.8));

    outData[i] = highFreqR;
    outData[i + 1] = highFreqG;
    outData[i + 2] = highFreqB;
    outData[i + 3] = srcData[i + 3];
  }

  return output;
}

// Compute 8x8 Gram Matrix Representation for visual representation
export function computeGramMatrixRepresentation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number[][] {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const grid = 8;
  const matrix: number[][] = Array.from({ length: grid }, () => Array(grid).fill(0));

  const cellW = Math.floor(width / grid);
  const cellH = Math.floor(height / grid);

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      let sum = 0;
      let count = 0;
      for (let y = r * cellH; y < (r + 1) * cellH && y < height; y++) {
        for (let x = c * cellW; x < (c + 1) * cellW && x < width; x++) {
          const idx = (y * width + x) * 4;
          const rVal = data[idx];
          const gVal = data[idx + 1];
          const bVal = data[idx + 2];
          // Gram correlation calculation proxy
          sum += (rVal * gVal + gVal * bVal + bVal * rVal) / 255;
          count++;
        }
      }
      const val = count > 0 ? (sum / count) / 255 : 0;
      matrix[r][c] = Math.min(1, Math.max(0, val));
    }
  }

  return matrix;
}

// Generate procedurally synthesized autonomous AI brush stroke paths
export function generateRobotStrokePaths(
  width: number,
  height: number,
  count: number = 8
): { x: number; y: number; color: string; size: number }[] {
  const points: { x: number; y: number; color: string; size: number }[] = [];
  const palette = ['#38bdf8', '#818cf8', '#f43f5e', '#fde047', '#34d399', '#a855f7'];

  let startX = Math.random() * width;
  let startY = Math.random() * height;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const len = 40 + Math.random() * 80;
    startX = Math.max(20, Math.min(width - 20, startX + Math.cos(angle) * len));
    startY = Math.max(20, Math.min(height - 20, startY + Math.sin(angle) * len));

    points.push({
      x: startX,
      y: startY,
      color: palette[Math.floor(Math.random() * palette.length)],
      size: 8 + Math.random() * 16,
    });
  }

  return points;
}

// Convert any image source (SVG Data URI, external URL, or canvas) into a valid base64 PNG data string
export function rasterizeImageToPngBase64(
  imageSource: string | HTMLCanvasElement,
  width: number = 600,
  height: number = 600
): Promise<string> {
  return new Promise((resolve) => {
    if (imageSource instanceof HTMLCanvasElement) {
      try {
        resolve(imageSource.toDataURL('image/png'));
        return;
      } catch (err) {
        console.warn('Canvas export failed, falling back to offscreen render:', err);
      }
    }

    if (typeof imageSource === 'string' && imageSource.startsWith('data:image/png;base64,')) {
      resolve(imageSource);
      return;
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // Default neutral background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (!imageSource) {
      resolve(offscreen.toDataURL('image/png'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      resolve(offscreen.toDataURL('image/png'));
    };
    img.onerror = () => {
      resolve(offscreen.toDataURL('image/png'));
    };

    img.src = typeof imageSource === 'string' ? imageSource : '';
  });
}

// Algorithmic Neural Painterly Synthesis (Fallback & Live Filter Blending)
export function synthesizePainterlyNeuralTransfer(
  sourceCanvas: HTMLCanvasElement,
  styleName: string,
  contentWeight: number = 10,
  styleWeight: number = 1000
): string {
  const width = sourceCanvas.width || 600;
  const height = sourceCanvas.height || 600;
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return sourceCanvas.toDataURL('image/png');

  // 1. Draw base content
  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  // 2. Extract pixel data for stylized artistic pass
  const src = ctx.getImageData(0, 0, width, height);
  const data = src.data;

  // Determine palette bias based on style
  const styleLower = styleName.toLowerCase();
  let rBias = 1.0, gBias = 1.0, bBias = 1.0;
  if (styleLower.includes('starry')) {
    rBias = 0.8; gBias = 1.1; bBias = 1.6;
  } else if (styleLower.includes('wave') || styleLower.includes('hokusai')) {
    rBias = 0.7; gBias = 1.2; bBias = 1.8;
  } else if (styleLower.includes('monet') || styleLower.includes('water')) {
    rBias = 1.1; gBias = 1.4; bBias = 1.2;
  } else if (styleLower.includes('kandinsky') || styleLower.includes('composition')) {
    rBias = 1.5; gBias = 0.9; bBias = 1.4;
  } else if (styleLower.includes('cyberpunk') || styleLower.includes('neon')) {
    rBias = 1.6; gBias = 0.6; bBias = 1.8;
  }

  const alphaFactor = Math.min(1.0, Math.max(0.1, styleWeight / (contentWeight * 20 + styleWeight)));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Stylized quantization & Gram color enhancement
    const nr = Math.min(255, Math.max(0, (r * (1 - alphaFactor * 0.4) + (r * rBias) * (alphaFactor * 0.4))));
    const ng = Math.min(255, Math.max(0, (g * (1 - alphaFactor * 0.4) + (g * gBias) * (alphaFactor * 0.4))));
    const nb = Math.min(255, Math.max(0, (b * (1 - alphaFactor * 0.4) + (b * bBias) * (alphaFactor * 0.4))));

    // Impasto contrast boost
    const contrast = 1.2;
    data[i] = Math.min(255, Math.max(0, (nr - 128) * contrast + 128));
    data[i + 1] = Math.min(255, Math.max(0, (ng - 128) * contrast + 128));
    data[i + 2] = Math.min(255, Math.max(0, (nb - 128) * contrast + 128));
  }

  ctx.putImageData(src, 0, 0);

  // 3. Add textured brush stroke swirls
  ctx.save();
  ctx.globalAlpha = 0.25 * alphaFactor;
  ctx.lineWidth = 4;
  for (let s = 0; s < 40; s++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 15 + Math.random() * 35;
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.random() * Math.PI, Math.PI * (1.5 + Math.random()));
    ctx.strokeStyle = styleLower.includes('starry') ? '#fde047' : styleLower.includes('cyber') ? '#06b6d4' : '#ffffff';
    ctx.stroke();
  }
  ctx.restore();

  return offscreen.toDataURL('image/png');
}

// Universal High-Resolution Art Exporter for All Modes & Routes
export async function generateRouteExportDataUrl(options: {
  routePath: string;
  contentImageUrl: string | null;
  styleName?: string;
  robotActive?: boolean;
}): Promise<{ dataUrl: string; filename: string }> {
  const { routePath, contentImageUrl, styleName = 'Neural-Art', robotActive } = options;
  const timestamp = Date.now();

  // Helper to get fallback canvas if element exists
  const mainCanvas = document.getElementById('main-drawing-canvas') as HTMLCanvasElement;
  const anyCanvas = document.querySelector('canvas') as HTMLCanvasElement;

  // Case 1: CNN Feature Maps Inspector Route
  if (routePath.includes('cnn-inspector')) {
    const origCanvas = document.querySelectorAll('canvas')[0] as HTMLCanvasElement;
    const featCanvas = document.querySelectorAll('canvas')[1] as HTMLCanvasElement;

    const width = 800;
    const height = 450;
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');

    if (ctx) {
      // Dark slate studio background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Header Banner
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 20, width - 40, 50);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`VGG-19 Convolutional Feature Maps — ${styleName}`, 40, 52);

      // Draw original if available
      if (origCanvas) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(40, 90, 320, 320);
        ctx.drawImage(origCanvas, 40, 90, 320, 320);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('Original Canvas Input', 40, 430);
      }

      // Draw feature activation if available
      if (featCanvas) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(440, 90, 320, 320);
        ctx.drawImage(featCanvas, 440, 90, 320, 320);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px sans-serif';
        ctx.fillText('Neural Layer Gram Filter Pass', 440, 430);
      }

      return {
        dataUrl: offscreen.toDataURL('image/png'),
        filename: `cnn-feature-map-${styleName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`,
      };
    }
  }

  // Case 2: Robot Collab Route
  if (routePath.includes('robot-collab')) {
    const width = 700;
    const height = 700;
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw active artwork background or styled canvas
      if (contentImageUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          bgImg.onload = () => {
            ctx.drawImage(bgImg, 50, 80, 600, 540);
            resolve(true);
          };
          bgImg.onerror = () => resolve(false);
          bgImg.src = contentImageUrl;
        });
      } else if (mainCanvas || anyCanvas) {
        ctx.drawImage(mainCanvas || anyCanvas, 50, 80, 600, 540);
      }

      // Draw Robot Telemetry HUD Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(50, 20, 600, 48);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, 20, 600, 48);

      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`🤖 ROBOT ARM CO-CREATION TELEMETRY [2D IK ACTIVE]`, 70, 50);

      // Trajectory markings
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(350, 350, 180, 0, Math.PI * 1.5);
      ctx.stroke();

      return {
        dataUrl: offscreen.toDataURL('image/png'),
        filename: `robot-collab-art-${timestamp}.png`,
      };
    }
  }

  // Case 3: Style Gallery Route
  if (routePath.includes('gallery')) {
    const width = 600;
    const height = 600;
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');

    if (ctx) {
      if (contentImageUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, width, height);
            resolve(true);
          };
          bgImg.onerror = () => resolve(false);
          bgImg.src = contentImageUrl;
        });
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Style Masterpiece: ${styleName}`, 50, 300);
      }

      return {
        dataUrl: offscreen.toDataURL('image/png'),
        filename: `masterpiece-${styleName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`,
      };
    }
  }

  // Case 4: Neural Hub Route
  if (routePath.includes('neural-hub') || routePath.includes('edu-hub')) {
    const width = 800;
    const height = 480;
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Neural Net Painter — Architecture & Loss Blueprint', 40, 50);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 80, 340, 340);
      ctx.fillRect(420, 80, 340, 340);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('1. Content Loss (L_content)', 60, 120);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('L = 0.5 * ||F_l - P_l||^2', 60, 160);

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('2. Gram Style Loss (L_style)', 440, 120);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('G_ij = sum_k (F_ik * F_jk)', 440, 160);

      return {
        dataUrl: offscreen.toDataURL('image/png'),
        filename: `neural-loss-blueprint-${timestamp}.png`,
      };
    }
  }

  // Standard Canvas Studio Route (/canvas or /)
  if (mainCanvas) {
    return {
      dataUrl: mainCanvas.toDataURL('image/png'),
      filename: `neural-net-painter-${timestamp}.png`,
    };
  }

  if (contentImageUrl) {
    const rasterized = await rasterizeImageToPngBase64(contentImageUrl, 600, 600);
    return {
      dataUrl: rasterized,
      filename: `neural-net-painter-${timestamp}.png`,
    };
  }

  if (anyCanvas) {
    return {
      dataUrl: anyCanvas.toDataURL('image/png'),
      filename: `neural-net-painter-${timestamp}.png`,
    };
  }

  // Ultimate clean fallback
  const offscreen = document.createElement('canvas');
  offscreen.width = 600;
  offscreen.height = 600;
  const ctx = offscreen.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Neural Net Painter Artwork', 160, 300);
  }

  return {
    dataUrl: offscreen.toDataURL('image/png'),
    filename: `neural-net-painter-${timestamp}.png`,
  };
}

