import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Paintbrush,
  Cpu,
  Bot,
  Grid,
  BookOpen,
  Download,
  RefreshCw,
  Zap,
} from 'lucide-react';

export type AppMode = 'canvas' | 'cnn_inspector' | 'robot_collab' | 'gallery' | 'edu_hub';

interface HeaderProps {
  onExport: () => void;
  onResetCanvas: () => void;
  isProcessing: boolean;
  robotActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onExport,
  onResetCanvas,
  isProcessing,
  robotActive,
}) => {
  const location = useLocation();

  const navItems = [
    {
      to: '/canvas',
      aliases: ['/', '/canvas'],
      label: 'Canvas Studio',
      icon: Paintbrush,
      id: 'nav-route-canvas',
    },
    {
      to: '/cnn-inspector',
      aliases: ['/cnn-inspector'],
      label: 'CNN Feature Maps',
      icon: Cpu,
      id: 'nav-route-cnn-inspector',
    },
    {
      to: '/robot-collab',
      aliases: ['/robot-collab'],
      label: 'Robot Collab',
      icon: Bot,
      hasBadge: true,
      id: 'nav-route-robot-collab',
    },
    {
      to: '/gallery',
      aliases: ['/gallery'],
      label: 'Style Gallery',
      icon: Grid,
      id: 'nav-route-gallery',
    },
    {
      to: '/neural-hub',
      aliases: ['/neural-hub', '/edu-hub'],
      label: 'Neural Hub',
      icon: BookOpen,
      id: 'nav-route-neural-hub',
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <Link
          id="header-logo-link"
          to="/canvas"
          className="flex items-center space-x-3 group cursor-pointer transition-opacity hover:opacity-95"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
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
        </Link>

        {/* Mode Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.aliases.includes(location.pathname);

            return (
              <NavLink
                key={item.to}
                id={item.id}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.hasBadge && robotActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute top-1 right-1" />
                )}
              </NavLink>
            );
          })}
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
            id="btn-header-reset-canvas"
            onClick={onResetCanvas}
            title="Reset Canvas"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            id="btn-header-export-art"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Art</span>
          </button>
        </div>
      </div>
    </header>
  );
};
