import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ToolType,
  CanvasLayer,
  RobotArmConfig,
  CollaborationMode,
} from '../types';
import { computeRobotArmJoints } from '../utils/canvasEngine';
import {
  Pencil,
  Paintbrush,
  Eraser,
  Square,
  Circle as CircleIcon,
  Minus,
  PaintBucket,
  Bot,
  Layers,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Maximize2,
  Lock,
  Unlock,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PaintingCanvasProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  robotConfig: RobotArmConfig;
  setRobotConfig: React.Dispatch<React.SetStateAction<RobotArmConfig>>;
  layers: CanvasLayer[];
  setLayers: React.Dispatch<React.SetStateAction<CanvasLayer[]>>;
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  contentImageUrl: string | null;
  onCanvasChange?: () => void;
}

export const PaintingCanvas: React.FC<PaintingCanvasProps> = ({
  activeTool,
  setActiveTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  robotConfig,
  setRobotConfig,
  layers,
  setLayers,
  activeLayerId,
  setActiveLayerId,
  contentImageUrl,
  onCanvasChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const robotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 250, y: 250 });

  const canvasWidth = 600;
  const canvasHeight = 600;

  // Preset palette colors
  const colorPalette = [
    '#000000',
    '#ffffff',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#3b82f6',
    '#6366f1',
    '#a855f7',
    '#ec4899',
    '#78350f',
  ];

  // Draw content background image when updated
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (contentImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        if (onCanvasChange) onCanvasChange();
      };
      img.src = contentImageUrl;
    }
  }, [contentImageUrl]);

  // Main Canvas Drawing Handlers
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPoint(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCursorPos(pos);

    // Update Robot Arm target
    if (robotConfig.enabled) {
      setRobotConfig((prev) => ({
        ...prev,
        targetPos: pos,
      }));
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = brushOpacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : brushColor;
    ctx.fillStyle = brushColor;
    ctx.lineWidth = brushSize;

    if (activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'style_mask') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
      ctx.stroke();
    } else if (activeTool === 'spray') {
      drawSpray(ctx, pos.x, pos.y, brushSize, brushColor);
    } else if (activeTool === 'bucket') {
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    ctx.restore();
  };

  const drawSpray = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    const density = size * 4;
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() - 0.5) * size * 2;
      const offsetY = (Math.random() - 0.5) * size * 2;
      if (Math.hypot(offsetX, offsetY) <= size) {
        ctx.fillRect(x + offsetX, y + offsetY, 1.5, 1.5);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPoint(e);
    setCursorPos(pos);

    if (robotConfig.enabled) {
      setRobotConfig((prev) => ({
        ...prev,
        targetPos: pos,
      }));
    }

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = brushOpacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'style_mask') {
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = brushSize * 1.5;
      ctx.beginPath();
      if (startPos) ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setStartPos(pos);
    } else if (activeTool === 'brush' || activeTool === 'pencil' || activeTool === 'eraser') {
      ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : brushColor;
      ctx.lineWidth = activeTool === 'pencil' ? Math.max(1, brushSize / 2) : brushSize;
      ctx.beginPath();
      if (startPos) ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setStartPos(pos);
    } else if (activeTool === 'spray') {
      drawSpray(ctx, pos.x, pos.y, brushSize, brushColor);
    } else if (activeTool === 'robot_assist') {
      // Robot assisted smooth stroke
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      if (startPos) ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setStartPos(pos);
    }

    ctx.restore();
    if (onCanvasChange) onCanvasChange();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCanvasPoint(e);
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !startPos) return;

    ctx.save();
    ctx.globalAlpha = brushOpacity;
    ctx.strokeStyle = brushColor;
    ctx.fillStyle = brushColor;
    ctx.lineWidth = brushSize;

    if (activeTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (activeTool === 'rectangle') {
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    } else if (activeTool === 'circle') {
      const radius = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    setStartPos(null);
    if (onCanvasChange) onCanvasChange();
  };

  // Render 2D Articulated Robotic Arm Overlay
  useEffect(() => {
    const robotCanvas = robotCanvasRef.current;
    if (!robotCanvas) return;
    const ctx = robotCanvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const basePoint = { x: 550, y: 50 }; // Top right mount
    let target = robotConfig.targetPos || { x: cursorPos.x, y: cursorPos.y };

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (!robotConfig.enabled) return;

      // Lerp robot current position towards target
      const lerpFactor = 0.08 * (robotConfig.speed / 5);
      const curX = robotConfig.currentPos.x + (target.x - robotConfig.currentPos.x) * lerpFactor;
      const curY = robotConfig.currentPos.y + (target.y - robotConfig.currentPos.y) * lerpFactor;

      const joints = computeRobotArmJoints(basePoint, { x: curX, y: curY });

      // Draw Robot Base
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(basePoint.x, basePoint.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Base mount icon indicator
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(basePoint.x, basePoint.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Arm Segment 1 (Base -> Elbow)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(joints.base.x, joints.base.y);
      ctx.lineTo(joints.elbow.x, joints.elbow.y);
      ctx.stroke();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(joints.base.x, joints.base.y);
      ctx.lineTo(joints.elbow.x, joints.elbow.y);
      ctx.stroke();

      // Elbow Joint
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(joints.elbow.x, joints.elbow.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Arm Segment 2 (Elbow -> Wrist)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(joints.elbow.x, joints.elbow.y);
      ctx.lineTo(joints.wrist.x, joints.wrist.y);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(joints.elbow.x, joints.elbow.y);
      ctx.lineTo(joints.wrist.x, joints.wrist.y);
      ctx.stroke();

      // End Effector Laser / Brush Tip
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(joints.wrist.x, joints.wrist.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Laser guide line to target
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(joints.wrist.x, joints.wrist.y);
      ctx.lineTo(curX, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Laser Target reticle
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(curX, curY, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => cancelAnimationFrame(animId);
  }, [robotConfig, cursorPos]);

  // Handle Layer addition/deletion
  const addLayer = () => {
    const newId = `layer-${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1.0,
      blendMode: 'source-over',
      locked: false,
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newId);
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return; // Keep at least one
    const updated = layers.filter((l) => l.id !== id);
    setLayers(updated);
    if (activeLayerId === id) {
      setActiveLayerId(updated[0].id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Tools Sidebar */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-indigo-400" />
            <span>Brush & Tools</span>
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {activeTool.toUpperCase()}
          </span>
        </div>

        {/* Tool Palette */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'brush', label: 'Brush', icon: Paintbrush },
            { id: 'pencil', label: 'Pencil', icon: Pencil },
            { id: 'spray', label: 'Spray', icon: Sparkles },
            { id: 'eraser', label: 'Eraser', icon: Eraser },
            { id: 'line', label: 'Line', icon: Minus },
            { id: 'rectangle', label: 'Rect', icon: Square },
            { id: 'circle', label: 'Circle', icon: CircleIcon },
            { id: 'bucket', label: 'Bucket', icon: PaintBucket },
            { id: 'robot_assist', label: 'Robot AI', icon: Bot },
            { id: 'style_mask', label: 'Style Mask', icon: Zap },
          ].map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as ToolType)}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-xs gap-1 transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Brush Size & Opacity Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Size:</span>
              <span className="font-mono text-indigo-400">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Opacity:</span>
              <span className="font-mono text-indigo-400">
                {Math.round(brushOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={brushOpacity}
              onChange={(e) => setBrushOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Color Palette</span>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {colorPalette.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-lg transition-transform border ${
                  brushColor === color
                    ? 'scale-110 border-white ring-2 ring-indigo-500'
                    : 'border-slate-700 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Robot Arm Collab Toggle */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Robotic Co-Pilot</p>
                <p className="text-[10px] text-slate-400">2D Arm Kinematics</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={robotConfig.enabled}
                onChange={(e) =>
                  setRobotConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-xl overflow-hidden">
        {/* Canvas Header Info */}
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 px-2">
          <span className="flex items-center gap-1.5 font-mono text-cyan-400">
            <Maximize2 className="w-3.5 h-3.5" />
            600 x 600 px
          </span>
          <span className="flex items-center gap-1">
            Cursor: <span className="font-mono text-indigo-300">{Math.round(cursorPos.x)}, {Math.round(cursorPos.y)}</span>
          </span>
        </div>

        {/* Stacked Canvas Container */}
        <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] bg-slate-900 rounded-xl border-2 border-slate-800 overflow-hidden shadow-2xl cursor-crosshair">
          {/* Main Drawing Canvas */}
          <canvas
            id="main-drawing-canvas"
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="absolute top-0 left-0 w-full h-full z-10 touch-none"
          />

          {/* Robot Arm Overlay Canvas */}
          <canvas
            ref={robotCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
          />
        </div>
      </div>

      {/* Right Sidebar: Layers & Collaboration Modes */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
        {/* Layers Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Layer Stack</span>
          </h2>
          <button
            onClick={addLayer}
            className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            title="Add New Layer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Layers List */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {layers.map((layer) => {
            const isActive = layer.id === activeLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayerId(layer.id)}
                className={`p-2.5 rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 border-indigo-500 shadow-md'
                    : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLayers(
                        layers.map((l) =>
                          l.id === layer.id ? { ...l, visible: !l.visible } : l
                        )
                      );
                    }}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {layer.visible ? (
                      <Eye className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                  <span className="text-xs font-medium text-slate-200">
                    {layer.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLayers(
                        layers.map((l) =>
                          l.id === layer.id ? { ...l, locked: !l.locked } : l
                        )
                      );
                    }}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    {layer.locked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {layers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Robot Collaboration Mode Selector */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-cyan-400" />
            Collaboration Mode
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'co_pilot', label: 'Co-Pilot Smooth', desc: 'Smooths human strokes' },
              { id: 'auto_refine', label: 'Auto-Refine Details', desc: 'Adds high-res detail' },
              { id: 'style_mask', label: 'Style Mask Region', desc: 'Restricts neural style to mask' },
              { id: 'autonomous_ai', label: 'Autonomous AI Artist', desc: 'Full AI style painting' },
            ].map((mode) => {
              const isSelected = robotConfig.activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() =>
                    setRobotConfig((prev) => ({
                      ...prev,
                      activeMode: mode.id as CollaborationMode,
                    }))
                  }
                  className={`p-2 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-medium">{mode.label}</p>
                  <p className="text-[10px] text-slate-500">{mode.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
