import React from "react";

interface Props {
  show: boolean;
  selectedFile: File | null;
  totalFrames: number;
  framesToAnalyze: number;
  setFramesToAnalyze: (n: number) => void;
  setShow: (v: boolean) => void;
  startAnalysis: () => Promise<void>;
  setAnalysisState: (s: "IDLE" | "UPLOADING" | "ANALYZING") => void;
}

const FrameInputModal: React.FC<Props> = ({
  show,
  selectedFile,
  totalFrames,
  framesToAnalyze,
  setFramesToAnalyze,
  setShow,
  startAnalysis,
  setAnalysisState,
}) => {
  if (!show || !selectedFile) return null;

  const maxFramesToAnalyze = Math.min(200, totalFrames);
  const frameSkipInterval = Math.ceil(maxFramesToAnalyze / (framesToAnalyze || 1));
  const isInvalid = framesToAnalyze > maxFramesToAnalyze || framesToAnalyze < 20;

  const presets = [
    { label: "Quick", frames: 20, color: "green" },
    { label: "Standard", frames: 80, color: "blue" },
    { label: "Advanced", frames: 140, color: "purple" },
    { label: "Deep", frames: maxFramesToAnalyze, color: "red" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col border border-gray-100 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-gray-700 p-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">🎬 Analysis Settings</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">How Many Frames to Analyze?</label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">📊 Total: <span className="font-bold text-indigo-600 dark:text-teal-400">{totalFrames}</span> | Max: <span className="font-bold text-indigo-600 dark:text-teal-400">{maxFramesToAnalyze}</span></p>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Slider:</label>
            <input type="range" min={20} max={maxFramesToAnalyze} step={4} value={framesToAnalyze} onChange={(e) => setFramesToAnalyze(Number(e.target.value))} className="w-full h-3 bg-gradient-to-r from-green-200 via-indigo-300 dark:via-teal-300 to-red-400 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-teal-500" />
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {presets.map((preset) => {
              const isSelected = framesToAnalyze === preset.frames;
              const colorClasses: Record<string, string> = {
                green: isSelected ? "bg-green-600 text-white shadow-lg scale-105" : "bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:shadow-md",
                blue: isSelected ? "bg-indigo-600 dark:bg-teal-600 text-white shadow-lg scale-105" : "bg-white dark:bg-slate-700 text-indigo-600 dark:text-teal-400 border-indigo-400 dark:border-teal-400 hover:bg-indigo-50 dark:hover:bg-teal-900/30 hover:shadow-md",
                purple: isSelected ? "bg-purple-600 text-white shadow-lg scale-105" : "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:shadow-md",
                red: isSelected ? "bg-red-600 text-white shadow-lg scale-105" : "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-md",
              };

              return (
                <button key={preset.label} onClick={() => setFramesToAnalyze(preset.frames)} className={`p-3 rounded-lg border-2 transition-all duration-200 font-bold cursor-pointer active:scale-95 ${colorClasses[preset.color]}`}>
                  <p className="text-lg font-bold mb-2 uppercase">{preset.label}</p>
                  <div className="text-xs opacity-70"><span className="font-semibold">{preset.frames}</span><span className="ml-1">frames</span></div>
                </button>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-2 border-indigo-200 dark:border-teal-800 rounded-lg p-3 mb-4">
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 font-semibold">📊 Summary:</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Analyze</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-teal-400">{framesToAnalyze}</p>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Max</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-white">{maxFramesToAnalyze}</p>
              </div>
            </div>

            {isInvalid && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-2">
                <p className="text-xs text-red-700 dark:text-red-400 font-bold">⚠️ Invalid! Enter 20-{maxFramesToAnalyze} (multiples of 4)</p>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Skip every <span className="font-bold">{frameSkipInterval}</span> frame (from {totalFrames} total)</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t dark:border-gray-700 p-4 flex gap-3">
          <button onClick={() => { setShow(false); setFramesToAnalyze(20); setAnalysisState("IDLE"); }} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition font-medium text-sm">❌ Cancel</button>
          <button onClick={() => { setShow(false); void startAnalysis(); }} disabled={isInvalid} className={`flex-1 px-4 py-2 rounded-lg transition font-bold text-sm ${isInvalid ? "bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white"}`}>
            ✅ Start Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameInputModal;
