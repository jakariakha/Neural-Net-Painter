export type ToolType =
  | 'brush'
  | 'pencil'
  | 'spray'
  | 'eraser'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'bucket'
  | 'robot_assist'
  | 'style_mask';

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  locked: boolean;
  dataUrl?: string;
  isRobotLayer?: boolean;
}

export interface StylePreset {
  id: string;
  name: string;
  artist: string;
  period: string;
  description: string;
  thumbnail: string;
  samplePrompt: string;
  contentWeightDefault: number;
  styleWeightDefault: number;
  recommendedLayers: string[];
}

export interface ContentSample {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export interface CNNLayerActivation {
  name: string;
  type: 'Conv1_1' | 'Conv2_1' | 'Conv3_1' | 'Conv4_1' | 'Conv5_1';
  description: string;
  resolution: string;
  channels: number;
  featureMaps: string[]; // data URLs or base64 previews of feature channels
  gramMatrixData: number[][]; // 8x8 sample representation of Gram Matrix
  contentLossContrib: number;
  styleLossContrib: number;
}

export type CollaborationMode =
  | 'co_pilot'       // Robot assists human strokes in real time
  | 'auto_refine'    // Robot automatically details selected regions
  | 'style_mask'     // Robot restricts neural style transfer to masked areas
  | 'autonomous_ai'; // Robot paints full canvas based on prompt & style

export interface RobotArmConfig {
  enabled: boolean;
  speed: number;        // 1 to 10
  precision: number;    // 0 to 100%
  pressure: number;     // 0 to 100%
  jointAngles: {
    base: number;       // degrees
    shoulder: number;
    elbow: number;
    wrist: number;
  };
  activeMode: CollaborationMode;
  targetPos: { x: number; y: number } | null;
  currentPos: { x: number; y: number };
  strokeTrail: { x: number; y: number; color: string; size: number }[];
}

export interface StyleTransferConfig {
  contentWeight: number;    // alpha
  styleWeight: number;      // beta
  tvWeight: number;         // Total Variation loss weight
  epochs: number;           // Total iterations (e.g. 200)
  currentEpoch: number;
  learningRate: number;
  selectedLayers: {
    conv1: boolean;
    conv2: boolean;
    conv3: boolean;
    conv4: boolean;
    conv5: boolean;
  };
  customStylePrompt: string;
  styleImageUrl: string | null;
  contentImageUrl: string | null;
}

export interface StyleSynthesisResult {
  imageUrl: string;
  contentFidelityScore: number;
  styleAdherenceScore: number;
  aiAnalysis: {
    composition: string;
    dominantPalette: string[];
    textureEnergy: string;
    collaborationTip: string;
  };
  cNNMetrics: {
    contentLoss: number;
    styleLoss: number;
    totalLoss: number;
  };
}

export interface HistorySnapshot {
  id: string;
  timestamp: string;
  epoch: number;
  thumbnail: string;
  description: string;
}
