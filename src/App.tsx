/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ToolType,
  CanvasLayer,
  RobotArmConfig,
  StyleTransferConfig,
  StyleSynthesisResult,
  StylePreset,
} from './types';
import { STYLE_PRESETS } from './data/stylePresets';
import { generateRobotStrokePaths } from './utils/canvasEngine';
import { Header, AppMode } from './components/Header';
import { PaintingCanvas } from './components/PaintingCanvas';
import { StyleTransferPanel } from './components/StyleTransferPanel';
import { CNNFeatureMapInspector } from './components/CNNFeatureMapInspector';
import { RobotCollaboratorPanel } from './components/RobotCollaboratorPanel';
import { StyleGallery } from './components/StyleGallery';
import { NeuralEduHub } from './components/NeuralEduHub';
import { Sparkles, Bot, Zap, Activity } from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>('canvas');
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [brushColor, setBrushColor] = useState<string>('#38bdf8');
  const [brushSize, setBrushSize] = useState<number>(12);
  const [brushOpacity, setBrushOpacity] = useState<number>(1.0);

  // Default Layers
  const [layers, setLayers] = useState<CanvasLayer[]>([
    {
      id: 'layer-content',
      name: 'Content Image Base',
      visible: true,
      opacity: 1.0,
      blendMode: 'source-over',
      locked: false,
    },
    {
      id: 'layer-human',
      name: 'Human Paint Layer',
      visible: true,
      opacity: 1.0,
      blendMode: 'source-over',
      locked: false,
    },
    {
      id: 'layer-robot',
      name: 'Robot AI Strokes',
      visible: true,
      opacity: 0.9,
      blendMode: 'source-over',
      locked: false,
      isRobotLayer: true,
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-human');

  // Robot Arm Configuration
  const [robotConfig, setRobotConfig] = useState<RobotArmConfig>({
    enabled: true,
    speed: 6,
    precision: 92,
    pressure: 80,
    jointAngles: { base: 45, shoulder: -30, elbow: 85, wrist: 10 },
    activeMode: 'co_pilot',
    targetPos: { x: 300, y: 300 },
    currentPos: { x: 500, y: 100 },
    strokeTrail: [],
  });

  // Style Transfer Configuration
  const [styleConfig, setStyleConfig] = useState<StyleTransferConfig>({
    contentWeight: 10,
    styleWeight: 1000,
    tvWeight: 0.001,
    epochs: 200,
    currentEpoch: 0,
    learningRate: 0.01,
    selectedLayers: {
      conv1: true,
      conv2: true,
      conv3: true,
      conv4: true,
      conv5: true,
    },
    customStylePrompt: STYLE_PRESETS[0].samplePrompt,
    styleImageUrl: STYLE_PRESETS[0].thumbnail,
    contentImageUrl: null,
  });

  const [contentImageUrl, setContentImageUrl] = useState<string | null>(
    STYLE_PRESETS[0].thumbnail
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Trigger Neural Style Transfer API call
  const handleRunStyleTransfer = async () => {
    setIsProcessing(true);
    try {
      // 1. Call CNN Vision & Layer Analysis API
      const analyzeRes = await fetch('/api/cnn-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentImageBase64: contentImageUrl,
          styleName: STYLE_PRESETS[0].name,
          stylePrompt: styleConfig.customStylePrompt,
          contentWeight: styleConfig.contentWeight,
          styleWeight: styleConfig.styleWeight,
        }),
      });

      const analyzeJson = await analyzeRes.json();
      if (analyzeJson.success) {
        setAnalysisResult(analyzeJson.data);
      }

      // 2. Call Image Style Transfer Synthesis API
      const styleRes = await fetch('/api/style-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentImageBase64: contentImageUrl,
          stylePrompt: styleConfig.customStylePrompt,
          styleName: STYLE_PRESETS[0].name,
          robotBrushAssist: robotConfig.enabled,
        }),
      });

      const styleJson = await styleRes.json();
      if (styleJson.success && styleJson.imageUrl) {
        setContentImageUrl(styleJson.imageUrl);
      }
    } catch (err) {
      console.error('Style transfer error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Autonomous AI Robot Stroke Pass
  const handleTriggerAutonomousStroke = () => {
    const strokes = generateRobotStrokePaths(600, 600, 10);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= strokes.length) {
        clearInterval(interval);
        return;
      }
      const st = strokes[idx];
      setRobotConfig((prev) => ({
        ...prev,
        targetPos: { x: st.x, y: st.y },
      }));
      idx++;
    }, 180);
  };

  // Select Preset from Gallery or Panel
  const handleSelectPreset = (preset: StylePreset) => {
    setStyleConfig((prev) => ({
      ...prev,
      contentWeight: preset.contentWeightDefault,
      styleWeight: preset.styleWeightDefault,
      customStylePrompt: preset.samplePrompt,
      styleImageUrl: preset.thumbnail,
    }));
    setActiveMode('canvas');
  };

  // Select Sample Content Image
  const handleSelectContentSample = (url: string) => {
    setContentImageUrl(url);
  };

  // Export Canvas artwork as PNG
  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `neural-net-painter-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Reset Canvas
  const handleResetCanvas = () => {
    setContentImageUrl(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <Header
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onExport={handleExport}
        onResetCanvas={handleResetCanvas}
        isProcessing={isProcessing}
        robotActive={robotConfig.enabled}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* MODE 1: CANVAS STUDIO */}
        {activeMode === 'canvas' && (
          <div className="space-y-6">
            <PaintingCanvas
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              brushOpacity={brushOpacity}
              setBrushOpacity={setBrushOpacity}
              robotConfig={robotConfig}
              setRobotConfig={setRobotConfig}
              layers={layers}
              setLayers={setLayers}
              activeLayerId={activeLayerId}
              setActiveLayerId={setActiveLayerId}
              contentImageUrl={contentImageUrl}
            />

            {/* Style Transfer Loss Control Panel */}
            <StyleTransferPanel
              styleConfig={styleConfig}
              setStyleConfig={setStyleConfig}
              onRunStyleTransfer={handleRunStyleTransfer}
              onSelectContentSample={handleSelectContentSample}
              isProcessing={isProcessing}
            />

            {/* Analysis Results Metrics Bar */}
            {analysisResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Neural Analysis & Gram Loss Metrics</span>
                  </h3>
                  <span className="text-xs font-mono text-cyan-400">
                    Gram Energy: {analysisResult.aiAnalysis?.textureEnergy || 'High'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">Content Fidelity</span>
                    <p className="text-base font-bold font-mono text-cyan-400">
                      {analysisResult.contentFidelityScore || 85}%
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">Style Adherence</span>
                    <p className="text-base font-bold font-mono text-indigo-400">
                      {analysisResult.styleAdherenceScore || 92}%
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">Content Loss (Alpha)</span>
                    <p className="text-base font-bold font-mono text-purple-400">
                      {analysisResult.cNNMetrics?.contentLoss || 12.4}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">Gram Loss (Beta)</span>
                    <p className="text-base font-bold font-mono text-emerald-400">
                      {analysisResult.cNNMetrics?.styleLoss || 148.2}
                    </p>
                  </div>
                </div>

                {analysisResult.aiAnalysis?.collaborationTip && (
                  <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800 text-xs text-indigo-200">
                    <span className="font-bold text-cyan-300">Robot Co-Pilot Suggestion: </span>
                    {analysisResult.aiAnalysis.collaborationTip}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: CNN FEATURE INSPECTOR */}
        {activeMode === 'cnn_inspector' && (
          <CNNFeatureMapInspector
            contentImageUrl={contentImageUrl}
            styleName={STYLE_PRESETS[0].name}
          />
        )}

        {/* MODE 3: ROBOT COLLABORATION PANEL */}
        {activeMode === 'robot_collab' && (
          <RobotCollaboratorPanel
            robotConfig={robotConfig}
            setRobotConfig={setRobotConfig}
            onTriggerAutonomousStroke={handleTriggerAutonomousStroke}
          />
        )}

        {/* MODE 4: STYLE GALLERY */}
        {activeMode === 'gallery' && (
          <StyleGallery onSelectPreset={handleSelectPreset} />
        )}

        {/* MODE 5: NEURAL EDUCATION HUB */}
        {activeMode === 'edu_hub' && <NeuralEduHub />}
      </main>
    </div>
  );
}
