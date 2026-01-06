import React, { useRef } from 'react';
import { AVAILABLE_FONTS, NEON_COLORS, NeonConfig } from '../types';
import { Type, Palette, Download, LayoutTemplate, Activity, Image as ImageIcon, Sliders, Zap } from 'lucide-react';

interface ControlPanelProps {
  config: NeonConfig;
  onChange: (newConfig: NeonConfig) => void;
  onExport: () => void;
  isProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange, onExport, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof NeonConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                handleChange('image', ev.target.result as string);
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="w-full md:w-80 bg-gray-800 border-r border-gray-700 p-6 flex flex-col gap-6 h-auto md:h-screen overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-blue-500/50"></div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          NeonBuilder
        </h1>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1 bg-gray-900 rounded-lg">
        <button
            onClick={() => handleChange('mode', 'text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                config.mode === 'text' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
        >
            <Type size={14} /> Text
        </button>
        <button
            onClick={() => handleChange('mode', 'image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                config.mode === 'image' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
        >
            <ImageIcon size={14} /> Image
        </button>
      </div>

      {config.mode === 'text' ? (
          <>
            {/* Text Input */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <Type size={16} /> Text
                </label>
                <input
                type="text"
                value={config.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Enter text..."
                />
            </div>

            {/* Font Selection */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <Type size={16} /> Font (Single Line)
                </label>
                <div className="grid grid-cols-1 gap-2">
                {AVAILABLE_FONTS.map((font) => (
                    <button
                    key={font.name}
                    onClick={() => handleChange('fontFamily', font.name)}
                    className={`p-2 rounded-md text-left transition-all border flex flex-col ${
                        config.fontFamily === font.name
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                    >
                    <span className="font-medium">{font.label}</span>
                    <span className="text-xs text-gray-500 opacity-70">CNC Optimized</span>
                    </button>
                ))}
                </div>
            </div>
          </>
      ) : (
          <>
             {/* Image Upload */}
             <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <ImageIcon size={16} /> Upload Neon Image
                </label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-700/50 transition-all text-gray-500 hover:text-blue-400"
                >
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs">Click to upload image</span>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
                
                {/* Threshold Control */}
                <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-400">Detection Threshold</label>
                        <span className="text-xs text-gray-500">{config.threshold}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="255" 
                        value={config.threshold}
                        onChange={(e) => handleChange('threshold', parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
             </div>
          </>
      )}

      {/* Gap Merge Control (New) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Zap size={16} /> Gap Fix (Merge)
            </label>
            <span className="text-xs text-gray-500">{config.gapMergeDistance}px</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="100" 
            step="1"
            value={config.gapMergeDistance}
            onChange={(e) => handleChange('gapMergeDistance', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <p className="text-[10px] text-gray-500">Joins broken lines within this distance.</p>
      </div>

      {/* Smoothing Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Activity size={16} /> Smoothness (Power)
            </label>
            <span className="text-xs text-gray-500">{config.smoothing}%</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="100" 
            step="1"
            value={config.smoothing}
            onChange={(e) => handleChange('smoothing', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
            <span>Detailed</span>
            <span>Abstract</span>
        </div>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
          <Palette size={16} /> Neon Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {NEON_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => handleChange('color', color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                config.color === color.value ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value, boxShadow: `0 0 10px ${color.value}` }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Background Picker */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
          <LayoutTemplate size={16} /> Background
        </label>
        <select
          value={config.backgroundTexture}
          onChange={(e) => handleChange('backgroundTexture', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:outline-none"
        >
          <option value="none">Plain Dark</option>
          <option value="brick">Dark Brick Wall</option>
          <option value="concrete">Concrete</option>
          <option value="grid">Engineering Grid</option>
        </select>
      </div>

       {/* Actions */}
       <div className="mt-auto pt-6 border-t border-gray-700">
        <button
          onClick={onExport}
          disabled={isProcessing || (config.mode === 'image' && !config.image)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {isProcessing ? 'Processing...' : 'Download SVG'}
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Exports G-code ready SVG.
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;