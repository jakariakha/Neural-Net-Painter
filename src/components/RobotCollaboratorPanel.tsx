import React from 'react';
import { RobotArmConfig, CollaborationMode } from '../types';
import { Bot, Zap, Cpu, Gauge, Compass, Radio, Activity, Play, Pause, RefreshCw } from 'lucide-react';

interface RobotCollaboratorPanelProps {
  robotConfig: RobotArmConfig;
  setRobotConfig: React.Dispatch<React.SetStateAction<RobotArmConfig>>;
  onTriggerAutonomousStroke: () => void;
}

export const RobotCollaboratorPanel: React.FC<RobotCollaboratorPanelProps> = ({
  robotConfig,
  setRobotConfig,
  onTriggerAutonomousStroke,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Robotic Painting Arm Telemetry</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                2D Kinematics Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Human-Robot Collaborative Art Studio with Real-time Inverse Kinematics (IK) & Neural Trajectory Planning
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerAutonomousStroke}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Zap className="w-4 h-4 text-yellow-300" />
          <span>Execute Autonomous AI Stroke Pass</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Robot Arm Controls & Speeds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Kinematic Servo Controls</span>
          </h3>

          {/* Speed Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Servo Movement Speed:</span>
              <span className="font-mono text-cyan-400">{robotConfig.speed} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={robotConfig.speed}
              onChange={(e) =>
                setRobotConfig((prev) => ({ ...prev, speed: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Precision Jitter Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Stroke Precision Accuracy:</span>
              <span className="font-mono text-emerald-400">{robotConfig.precision}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={robotConfig.precision}
              onChange={(e) =>
                setRobotConfig((prev) => ({ ...prev, precision: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Pressure Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>End Effector Pressure:</span>
              <span className="font-mono text-indigo-400">{robotConfig.pressure}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={robotConfig.pressure}
              onChange={(e) =>
                setRobotConfig((prev) => ({ ...prev, pressure: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Joint Angle Telemetry Monitors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Joint Angle Live Telemetry</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 mb-1">Base Motor</span>
              <span className="font-mono text-base font-bold text-cyan-400">
                55.0°
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 mb-1">Shoulder Servo</span>
              <span className="font-mono text-base font-bold text-indigo-400">
                -32.4°
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 mb-1">Elbow Joint</span>
              <span className="font-mono text-base font-bold text-purple-400">
                88.1°
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 mb-1">Wrist Actuator</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                12.5°
              </span>
            </div>
          </div>
        </div>

        {/* Human-Robot Collaboration Strategy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Collaboration Mode</span>
          </h3>

          <div className="space-y-2">
            {[
              {
                id: 'co_pilot',
                title: 'Co-Pilot Smooth Tracking',
                desc: 'Robot follows human mouse movements in real-time, removing jitter and smoothing curves.',
              },
              {
                id: 'auto_refine',
                title: 'Auto-Refine Details',
                desc: 'Human draws overall shapes; Robot autonomously fills in high-frequency neural style details.',
              },
              {
                id: 'style_mask',
                title: 'Style Mask Region',
                desc: 'Robot restricts neural style transfer synthesis strictly inside human-painted mask boundaries.',
              },
              {
                id: 'autonomous_ai',
                title: 'Autonomous AI Artist',
                desc: 'Robot paints the full canvas independently guided by style prompts and Gram Loss.',
              },
            ].map((m) => {
              const isSelected = robotConfig.activeMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() =>
                    setRobotConfig((prev) => ({
                      ...prev,
                      activeMode: m.id as CollaborationMode,
                    }))
                  }
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{m.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
