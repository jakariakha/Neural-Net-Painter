import React from 'react';
import { BookOpen, Cpu, Sparkles, Network, Bot, Download } from 'lucide-react';

interface NeuralEduHubProps {
  onExport?: () => void;
}

export const NeuralEduHub: React.FC<NeuralEduHubProps> = ({ onExport }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Interactive Learning Hub
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            The Science of Convolutional Neural Style Transfer & Robotic Co-Creation
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Neural Style Transfer uses deep Convolutional Neural Networks (CNNs) like VGG-19 to separate and recombine the <span className="text-cyan-300 font-semibold">content</span> of one image with the <span className="text-indigo-300 font-semibold">artistic style</span> of another, enabling seamless human and robotic collaboration.
          </p>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-all shadow-md flex-shrink-0 relative z-10"
          >
            <Download className="w-4 h-4" />
            <span>Export Blueprint</span>
          </button>
        )}
      </div>

      {/* 3 Core Educational Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Content Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">1. Content Loss (L_content)</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Preserves object shapes, outlines, and structural layout. Deeper CNN layers (such as Conv4_1) extract high-level semantic representations without being affected by pixel-level color or fine brush textures.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300">
            L_content(p, x, l) = 0.5 * sum((F_l - P_l)^2)
          </div>
        </div>

        {/* Column 2: Style Loss & Gram Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">2. Gram Matrix Style Loss (L_style)</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Artistic style is defined as feature co-occurrences. The Gram Matrix G = F * F^T computes correlations across feature channels, capturing textures, brush marks, and color harmonies regardless of spatial location.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-300">
            G_ij = sum_k (F_ik * F_jk)
          </div>
        </div>

        {/* Column 3: Human Robot Co-Creation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">3. Human-Robot Co-Creation</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Humans provide high-level creative vision, gesture masks, and composition choices, while the 2D Robotic Arm executes precision trajectory smoothing, impasto stroke detailing, and Gram Loss optimization passes.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300">
            Total Loss = alpha * L_content + beta * L_style
          </div>
        </div>
      </div>

      {/* Interactive Workflow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Style Transfer Optimization Loop</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {[
            { step: '01', title: 'Content Input', desc: 'Human artist draws or loads base content image' },
            { step: '02', title: 'VGG-19 Pass', desc: 'CNN extracts content features & Gram Matrix textures' },
            { step: '03', title: 'Loss Gradient', desc: 'Backpropagates content vs style loss differential' },
            { step: '04', title: 'Robot Arm Pass', desc: 'Robotic end effector paints optimized canvas strokes' },
          ].map((s) => (
            <div key={s.step} className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative">
              <span className="text-xs font-mono font-bold text-indigo-400 block mb-1">
                STEP {s.step}
              </span>
              <h4 className="text-sm font-bold text-white mb-1">{s.title}</h4>
              <p className="text-[11px] text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
