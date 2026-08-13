import React, { useState, useEffect, useRef } from 'react';
import {
  applySobelEdgeFilter,
  applyGramTextureFilter,
  computeGramMatrixRepresentation,
} from '../utils/canvasEngine';
import { Cpu, Eye, Network, Layers, Sparkles, Activity, CheckCircle } from 'lucide-react';

interface CNNFeatureMapInspectorProps {
  contentImageUrl: string | null;
  styleName: string;
}

export const CNNFeatureMapInspector: React.FC<CNNFeatureMapInspectorProps> = ({
  contentImageUrl,
  styleName,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<
    'Conv1_1' | 'Conv2_1' | 'Conv3_1' | 'Conv4_1' | 'Conv5_1'
  >('Conv2_1');

  const canvasOriginalRef = useRef<HTMLCanvasElement | null>(null);
  const canvasFeatureRef = useRef<HTMLCanvasElement | null>(null);
  const [gramMatrix, setGramMatrix] = useState<number[][]>([]);

  // Render filters based on selected layer
  useEffect(() => {
    const origCanvas = canvasOriginalRef.current;
    const featCanvas = canvasFeatureRef.current;
    if (!origCanvas || !featCanvas) return;

    const ctxOrig = origCanvas.getContext('2d');
    const ctxFeat = featCanvas.getContext('2d');
    if (!ctxOrig || !ctxFeat) return;

    const width = 280;
    const height = 280;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctxOrig.clearRect(0, 0, width, height);
      ctxOrig.drawImage(img, 0, 0, width, height);

      ctxFeat.clearRect(0, 0, width, height);
      ctxFeat.drawImage(img, 0, 0, width, height);

      if (selectedLayer === 'Conv1_1' || selectedLayer === 'Conv2_1') {
        // Edge detection / Sobel
        const edgeData = applySobelEdgeFilter(ctxFeat, width, height);
        ctxFeat.putImageData(edgeData, 0, 0);
      } else {
        // Gram Texture High Pass
        const textureData = applyGramTextureFilter(ctxFeat, width, height, 0.9);
        ctxFeat.putImageData(textureData, 0, 0);
      }

      // Compute Gram Matrix
      const gMat = computeGramMatrixRepresentation(ctxFeat, width, height);
      setGramMatrix(gMat);
    };

    if (contentImageUrl) {
      img.src = contentImageUrl;
    } else {
      // Draw placeholder gradient if no content image
      ctxOrig.fillStyle = '#1e293b';
      ctxOrig.fillRect(0, 0, width, height);
      ctxOrig.fillStyle = '#38bdf8';
      ctxOrig.beginPath();
      ctxOrig.arc(140, 140, 60, 0, Math.PI * 2);
      ctxOrig.fill();

      ctxFeat.drawImage(origCanvas, 0, 0);
      const edgeData = applySobelEdgeFilter(ctxFeat, width, height);
      ctxFeat.putImageData(edgeData, 0, 0);
      const gMat = computeGramMatrixRepresentation(ctxFeat, width, height);
      setGramMatrix(gMat);
    }
  }, [contentImageUrl, selectedLayer]);

  const layersInfo = [
    {
      id: 'Conv1_1',
      title: 'Conv1_1: Low-Level Edges',
      channels: 64,
      desc: 'Captures sharp intensity gradients, boundaries, and primary color channels.',
      target: 'Content & Style Primary Edges',
    },
    {
      id: 'Conv2_1',
      title: 'Conv2_1: Local Textures',
      channels: 128,
      desc: 'Detects repetitive micro-patterns, fine hatching, and localized surface textures.',
      target: 'Gram Matrix Texture Correlation',
    },
    {
      id: 'Conv3_1',
      title: 'Conv3_1: Brushstroke Motifs',
      channels: 256,
      desc: 'Extracts medium-scale artistic motifs, curve orientation, and stroke directional flow.',
      target: 'Style Swirls & Impasto Shapes',
    },
    {
      id: 'Conv4_1',
      title: 'Conv4_1: Deep Semantic Features',
      channels: 512,
      desc: 'Represents object categories, facial geometry, and high-level structural semantics.',
      target: 'Content Loss Representation',
    },
    {
      id: 'Conv5_1',
      title: 'Conv5_1: Global Atmosphere',
      channels: 512,
      desc: 'Abstract spatial arrangements, color field mood, and overarching composition.',
      target: 'Global Mood & Lighting',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">VGG-19 CNN Feature Map Inspector</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Visualize how deep Convolutional Neural Networks decompose images into hierarchical feature maps. Content representation is preserved from deep layers (Conv4_1), while Style is extracted via Gram Matrix correlation (G_ij = sum(F_ik * F_jk)) across multiple convolutional levels.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <p className="text-xs font-semibold text-slate-200">Selected Style</p>
            <p className="text-xs font-mono text-cyan-400">{styleName || 'Starry Night'}</p>
          </div>
        </div>
      </div>

      {/* Layer Selection Architecture Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {layersInfo.map((l) => {
          const isSelected = selectedLayer === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setSelectedLayer(l.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{l.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-300">
                  {l.channels} Ch
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-200 mb-1">{l.title}</p>
              <p className="text-[10px] text-slate-400 line-clamp-2">{l.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Live Feature Map & Gram Matrix Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Original Canvas Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-400" />
            Original Image Canvas Input
          </h3>
          <canvas
            ref={canvasOriginalRef}
            width={280}
            height={280}
            className="rounded-xl border border-slate-800 bg-slate-950 shadow-inner"
          />
        </div>

        {/* Feature Map Activations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            {selectedLayer} Feature Map Filter Pass
          </h3>
          <canvas
            ref={canvasFeatureRef}
            width={280}
            height={280}
            className="rounded-xl border border-slate-800 bg-slate-950 shadow-inner"
          />
        </div>

        {/* Gram Matrix Correlation Heatmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between">
          <div className="w-full">
            <h3 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Network className="w-4 h-4 text-purple-400" />
              Gram Matrix G = F * F^T Heatmap
            </h3>
            <p className="text-[10px] text-slate-400 mb-3">
              Correlation matrix capturing texture & spatial feature co-occurrences
            </p>
          </div>

          {/* 8x8 Heatmap Grid */}
          <div className="grid grid-cols-8 gap-1 p-2 bg-slate-950 rounded-xl border border-slate-800 w-[240px] h-[240px]">
            {gramMatrix.map((row, rIdx) =>
              row.map((val, cIdx) => {
                // Color ramp from deep indigo to cyan to bright amber
                const hue = Math.floor(val * 240);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      backgroundColor: `hsl(${280 - hue}, 85%, ${20 + val * 50}%)`,
                    }}
                    title={`G[${rIdx},${cIdx}] = ${val.toFixed(3)}`}
                    className="w-full h-full rounded-[2px] transition-colors hover:scale-125 hover:z-10"
                  />
                );
              })
            )}
          </div>

          <div className="w-full flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Low Correlation (0.0)</span>
            <span>High Correlation (1.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
