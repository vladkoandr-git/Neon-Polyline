import React, { useRef, useEffect, useState } from 'react';
import { NeonConfig, PathData } from '../types';

interface PreviewCanvasProps {
  config: NeonConfig;
  paths: PathData[];
  isProcessing: boolean;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ config, paths, isProcessing }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        // Calculate scale to fit the base processing size (800x300) into view
        const scaleX = width / 800;
        const scaleY = height / 400;
        setScale(Math.min(scaleX, scaleY, 1.2)); // Cap zoom at 1.2
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use the pre-calculated Bezier path if available, otherwise fallback to Polyline
  const getPathData = (path: PathData) => {
    if (path.path) return path.path;
    if (path.points.length === 0) return '';
    return path.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  };

  const getBackgroundStyle = () => {
    switch (config.backgroundTexture) {
      case 'brick':
        return {
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
            url("https://picsum.photos/id/249/1000/1000?grayscale")
          `,
          backgroundSize: 'cover',
        };
      case 'concrete':
        return {
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
            url("https://picsum.photos/id/145/1000/1000?grayscale")
          `,
          backgroundSize: 'cover',
        };
      case 'grid':
        return {
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        };
      default:
        return { backgroundColor: '#111827' };
    }
  };

  return (
    <div 
      className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
      style={getBackgroundStyle()}
      ref={containerRef}
    >
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-400 font-mono text-sm animate-pulse">Calculating Centerline...</div>
        </div>
      )}

      {/* Main Vector Display */}
      <div 
        className="relative transition-transform duration-300 ease-out"
        style={{ 
          width: 800, 
          height: 300, 
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {paths.length === 0 && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono">
            Enter text to generate vector
          </div>
        )}

        <svg 
          width="800" 
          height="300" 
          viewBox="0 0 800 300" 
          className="overflow-visible"
        >
          {/* Defs for Glow Filter */}
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neon-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
               <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
               <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
               <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur3" />
               <feMerge>
                   <feMergeNode in="blur3" />
                   <feMergeNode in="blur2" />
                   <feMergeNode in="blur1" />
                   <feMergeNode in="SourceGraphic" />
               </feMerge>
            </filter>
          </defs>

          <g>
            {paths.map((pathData, index) => {
              const d = getPathData(pathData);
              return (
                <React.Fragment key={index}>
                  {/* 1. Outer Glow (Colored Blur) */}
                  <path
                    d={d}
                    fill="none"
                    stroke={config.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.4"
                    filter="url(#neon-glow-strong)"
                  />
                  
                  {/* 2. Core Glow (Colored) */}
                  <path
                    d={d}
                    fill="none"
                    stroke={config.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neon-glow)"
                  />

                  {/* 3. The actual Cut Line (White-ish hot center) */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                </React.Fragment>
              );
            })}
          </g>
        </svg>

        {/* Debug/Info Overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] text-gray-500 font-mono pointer-events-none">
           Paths: {paths.length} | Geometry: {paths[0]?.path ? 'Cubic Bezier' : 'Polyline'}
        </div>
      </div>
    </div>
  );
};

export default PreviewCanvas;