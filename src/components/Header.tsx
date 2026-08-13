import React from 'react';
import {
  Paintbrush,
  Cpu,
  Bot,
  Grid,
  BookOpen,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Zap,
} from 'lucide-react';

export type AppMode = 'canvas' | 'cnn_inspector' | 'robot_collab' | 'gallery' | 'edu_hub';

interface HeaderProps {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  onExport: () => void;
  onResetCanvas: () => void;
  isProcessing: boolean;
  robotActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  setActiveMode,
  onExport,
  onResetCanvas,
  isProcessing,
  robotActive,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-wide text-white flex items-center gap-1.5">
                Neural Net Painter
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                CNN Style-Transfer Studio
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI & Human-Robot Collaboration Canvas
            </p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveMode('canvas')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'canvas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Canvas Studio</span>
          </button>

          <button
            onClick={() => setActiveMode('cnn_inspector')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'cnn_inspector'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>CNN Feature Maps</span>
          </button>

          <button
            onClick={() => setActiveMode('robot_collab')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeMode === 'robot_collab'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Robot Collab</span>
            {robotActive && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveMode('gallery')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'gallery'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Style Gallery</span>
          </button>

          <button
            onClick={() => setActiveMode('edu_hub')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'edu_hub'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Neural Hub</span>
          </button>
        </nav>

        {/* Actions & Status */}
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs animate-pulse">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Neural Synthesis...</span>
            </div>
          )}

          <button
            onClick={onResetCanvas}
            title="Reset Canvas"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Art</span>
          </button>
        </div>
      </div>
    </header>
  );
};
