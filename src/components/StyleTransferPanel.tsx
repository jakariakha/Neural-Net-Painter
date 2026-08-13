import React, { useState } from 'react';
import { StylePreset, StyleTransferConfig } from '../types';
import { STYLE_PRESETS, SAMPLE_CONTENT_IMAGES } from '../data/stylePresets';
import { Sparkles, Sliders, Image as ImageIcon, Zap, Cpu, RefreshCw, Upload } from 'lucide-react';

interface StyleTransferPanelProps {
  styleConfig: StyleTransferConfig;
  setStyleConfig: React.Dispatch<React.SetStateAction<StyleTransferConfig>>;
  onRunStyleTransfer: () => void;
  onSelectContentSample: (url: string) => void;
  isProcessing: boolean;
}

export const StyleTransferPanel: React.FC<StyleTransferPanelProps> = ({
  styleConfig,
  setStyleConfig,
  onRunStyleTransfer,
  onSelectContentSample,
  isProcessing,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('starry-night');

  const handleSelectPreset = (preset: StylePreset) => {
    setSelectedPresetId(preset.id);
    setStyleConfig((prev) => ({
      ...prev,
      contentWeight: preset.contentWeightDefault,
      styleWeight: preset.styleWeightDefault,
      customStylePrompt: preset.samplePrompt,
      styleImageUrl: preset.thumbnail,
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Neural Style Transfer Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Balance Content Loss (alpha) and Style Gram Matrix Loss (beta)
          </p>
        </div>
        <button
          onClick={onRunStyleTransfer}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Optimizing Gram Loss...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Run Neural Synthesis</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Style Presets Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            Select Style Masterpiece
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
            {STYLE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={preset.thumbnail}
                    alt={preset.name}
                    className="w-full h-20 object-cover"
                  />
                  <div className="p-2 bg-slate-950/90">
                    <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{preset.artist}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Image Samples */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-indigo-400" />
            Load Sample Content Image
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_CONTENT_IMAGES.map((sample) => (
              <div
                key={sample.id}
                onClick={() => onSelectContentSample(sample.imageUrl)}
                className="relative rounded-xl border border-slate-800 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all group"
              >
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-1.5 bg-slate-950/90">
                  <p className="text-[11px] font-medium text-slate-200 truncate">
                    {sample.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Natural Language Style Descriptor
            </label>
            <textarea
              value={styleConfig.customStylePrompt}
              onChange={(e) =>
                setStyleConfig((prev) => ({ ...prev, customStylePrompt: e.target.value }))
              }
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="e.g. Swirling impasto oil strokes with vibrant neon pigments..."
            />
          </div>
        </div>

        {/* Neural Loss Weights Control Panel */}
        <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Loss Weights (alpha / beta)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
              VGG-19 Optimization
            </span>
          </div>

          {/* Content Weight Alpha Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Content Weight (Alpha):</span>
              <span className="font-mono text-cyan-400">{styleConfig.contentWeight}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={styleConfig.contentWeight}
              onChange={(e) =>
                setStyleConfig((prev) => ({ ...prev, contentWeight: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Higher = preserves structural outlines and content fidelity
            </p>
          </div>

          {/* Style Weight Beta Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Style Weight (Beta):</span>
              <span className="font-mono text-indigo-400">{styleConfig.styleWeight}</span>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="50"
              value={styleConfig.styleWeight}
              onChange={(e) =>
                setStyleConfig((prev) => ({ ...prev, styleWeight: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Higher = transfers dramatic textures and Gram matrix color correlation
            </p>
          </div>

          {/* Epochs Iteration Counter */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Epoch Optimization Iterations:</span>
              <span className="font-mono text-purple-400">{styleConfig.epochs} Iterations</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={styleConfig.epochs}
              onChange={(e) =>
                setStyleConfig((prev) => ({ ...prev, epochs: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
