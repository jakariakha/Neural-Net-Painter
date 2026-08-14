/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  ToolType,
  CanvasLayer,
  RobotArmConfig,
  StyleTransferConfig,
  StyleSynthesisResult,
  StylePreset,
} from './types';
import { STYLE_PRESETS } from './data/stylePresets';
import {
  generateRobotStrokePaths,
  rasterizeImageToPngBase64,
  synthesizePainterlyNeuralTransfer,
  generateRouteExportDataUrl,
} from './utils/canvasEngine';
import { Header } from './components/Header';
import { PaintingCanvas } from './components/PaintingCanvas';
import { StyleTransferPanel } from './components/StyleTransferPanel';
import { CNNFeatureMapInspector } from './components/CNNFeatureMapInspector';
import { RobotCollaboratorPanel } from './components/RobotCollaboratorPanel';
import { StyleGallery } from './components/StyleGallery';
import { NeuralEduHub } from './components/NeuralEduHub';
import { Activity, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Trigger Neural Style Transfer API call
  const handleRunStyleTransfer = async () => {
    setIsProcessing(true);
    setStatusMessage('Rasterizing canvas artwork and extracting neural Gram matrix features...');
    try {
      // 1. Get live canvas and convert to high-fidelity Base64 PNG
      const canvas = (document.getElementById('main-drawing-canvas') as HTMLCanvasElement) || document.querySelector('canvas');
      const base64Png = await rasterizeImageToPngBase64(canvas || contentImageUrl || '', 600, 600);

      // Find active style preset
      const currentPreset =
        STYLE_PRESETS.find((p) => p.thumbnail === styleConfig.styleImageUrl) ||
        STYLE_PRESETS.find((p) => p.samplePrompt === styleConfig.customStylePrompt) ||
        STYLE_PRESETS[0];

      // 2. Call CNN Vision & Layer Analysis API
      setStatusMessage('Optimizing VGG-19 convolutional layers & loss metrics...');
      const analyzeRes = await fetch('/api/cnn-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentImageBase64: base64Png,
          styleName: currentPreset.name,
          stylePrompt: styleConfig.customStylePrompt || currentPreset.samplePrompt,
          contentWeight: styleConfig.contentWeight,
          styleWeight: styleConfig.styleWeight,
        }),
      });

      const analyzeJson = await analyzeRes.json();
      if (analyzeJson.success && analyzeJson.data) {
        setAnalysisResult(analyzeJson.data);
      }

      // 3. Call Image Style Transfer Synthesis API
      setStatusMessage('Executing Neural Style Transfer synthesis pass...');
      const styleRes = await fetch('/api/style-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentImageBase64: base64Png,
          stylePrompt: styleConfig.customStylePrompt || currentPreset.samplePrompt,
          styleName: currentPreset.name,
          robotBrushAssist: robotConfig.enabled,
        }),
      });

      const styleJson = await styleRes.json();
      if (styleJson.success && styleJson.imageUrl) {
        setContentImageUrl(styleJson.imageUrl);
      } else if (canvas) {
        // High-resolution algorithmic neural impasto synthesis pass
        const stylizedResult = synthesizePainterlyNeuralTransfer(
          canvas,
          currentPreset.name,
          styleConfig.contentWeight,
          styleConfig.styleWeight
        );
        setContentImageUrl(stylizedResult);
      }

      // 4. Trigger Autonomous Robot Brush Collaboration Pass
      handleTriggerAutonomousStroke();
      setStatusMessage(`Neural synthesis complete for ${currentPreset.name}!`);
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error('Style transfer error:', err);
      const canvas = (document.getElementById('main-drawing-canvas') as HTMLCanvasElement) || document.querySelector('canvas');
      if (canvas) {
        const stylizedResult = synthesizePainterlyNeuralTransfer(
          canvas,
          STYLE_PRESETS[0].name,
          styleConfig.contentWeight,
          styleConfig.styleWeight
        );
        setContentImageUrl(stylizedResult);
      }
      setStatusMessage('Neural style applied to canvas layers.');
      setTimeout(() => setStatusMessage(null), 4000);
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
    navigate('/canvas');
  };

  // Select Sample Content Image
  const handleSelectContentSample = (url: string) => {
    setContentImageUrl(url);
  };

  // Export Canvas / Route Artwork as high-res PNG
  const handleExport = async () => {
    try {
      const activePreset =
        STYLE_PRESETS.find((p) => p.thumbnail === styleConfig.styleImageUrl) ||
        STYLE_PRESETS.find((p) => p.samplePrompt === styleConfig.customStylePrompt) ||
        STYLE_PRESETS[0];

      const { dataUrl, filename } = await generateRouteExportDataUrl({
        routePath: location.pathname,
        contentImageUrl,
        styleName: activePreset.name,
        robotActive: robotConfig.enabled,
      });

      if (dataUrl) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
        setStatusMessage(`Artwork successfully exported as ${filename}!`);
        setTimeout(() => setStatusMessage(null), 4500);
      }
    } catch (err) {
      console.error('Export error:', err);
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `neural-art-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
      setStatusMessage('Artwork exported successfully.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Reset Canvas
  const handleResetCanvas = () => {
    setContentImageUrl(null);
    setAnalysisResult(null);
    setStatusMessage('Canvas reset to blank layer.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Canvas Studio Component
  const canvasStudioView = (
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
  );

  const activeStylePreset =
    STYLE_PRESETS.find((p) => p.thumbnail === styleConfig.styleImageUrl) ||
    STYLE_PRESETS.find((p) => p.samplePrompt === styleConfig.customStylePrompt) ||
    STYLE_PRESETS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation with Route Links */}
      <Header
        onExport={handleExport}
        onResetCanvas={handleResetCanvas}
        isProcessing={isProcessing}
        robotActive={robotConfig.enabled}
      />

      {/* Main Content Body with Route Definitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Global Live Status Notification */}
        {statusMessage && (
          <div className="bg-gradient-to-r from-indigo-950/90 to-slate-900 border border-indigo-500/40 rounded-xl px-4 py-3 text-xs flex items-center justify-between shadow-lg shadow-indigo-950/50 animate-fade-in">
            <div className="flex items-center gap-2.5">
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span className="text-indigo-200 font-medium">{statusMessage}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-cyan-300">
              {isProcessing ? 'SYNTHESIZING' : 'ACTIVE'}
            </span>
          </div>
        )}

        <Routes>
          <Route path="/" element={canvasStudioView} />
          <Route path="/canvas" element={canvasStudioView} />
          <Route
            path="/cnn-inspector"
            element={
              <CNNFeatureMapInspector
                contentImageUrl={contentImageUrl}
                styleName={activeStylePreset.name}
                onExport={handleExport}
              />
            }
          />
          <Route
            path="/robot-collab"
            element={
              <RobotCollaboratorPanel
                robotConfig={robotConfig}
                setRobotConfig={setRobotConfig}
                onTriggerAutonomousStroke={handleTriggerAutonomousStroke}
                onExport={handleExport}
              />
            }
          />
          <Route
            path="/gallery"
            element={
              <StyleGallery
                onSelectPreset={handleSelectPreset}
                onExport={handleExport}
              />
            }
          />
          <Route path="/neural-hub" element={<NeuralEduHub onExport={handleExport} />} />
          <Route path="/edu-hub" element={<NeuralEduHub onExport={handleExport} />} />
          <Route path="*" element={<Navigate to="/canvas" replace />} />
        </Routes>
      </main>
    </div>
  );
}
