import React from 'react';
import { STYLE_PRESETS } from '../data/stylePresets';
import { StylePreset } from '../types';
import { Sparkles, Grid, ArrowRight, Play, Layers } from 'lucide-react';

interface StyleGalleryProps {
  onSelectPreset: (preset: StylePreset) => void;
}

export const StyleGallery: React.FC<StyleGalleryProps> = ({ onSelectPreset }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Grid className="w-6 h-6 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Curated Style Masterpieces Gallery</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Explore world-renowned artistic movements and style transfer presets. Each masterpiece includes recommended Gram Matrix layer weights and sample prompts for Instant Neural Canvas Loading.
          </p>
        </div>
      </div>

      {/* Masterpieces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STYLE_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-indigo-500/80 transition-all group"
          >
            <div>
              {/* Thumbnail Image */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-semibold text-cyan-300">
                  {preset.period}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-400">{preset.artist}</p>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>

                {/* Layer Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-1">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    CNN Layers:
                  </span>
                  {preset.recommendedLayers.map((layer) => (
                    <span
                      key={layer}
                      className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 text-[10px] font-mono"
                    >
                      {layer}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Load Button */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => onSelectPreset(preset)}
                className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Load Style into Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
