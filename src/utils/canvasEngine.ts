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
