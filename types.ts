export interface Point {
  x: number;
  y: number;
}

export interface PathData {
  points: Point[]; // Keep for fallback or debug
  path?: string;   // SVG Path Data (Bezier)
}

export interface NeonConfig {
  mode: 'text' | 'image'; // New toggle
  text: string;
  image: string | null;   // Data URL of uploaded image
  fontFamily: string;
  color: string;
  backgroundColor: string;
  backgroundTexture: 'none' | 'brick' | 'concrete' | 'grid';
  fontSize: number;
  blur: number;
  smoothing: number; 
  threshold: number; // New: Image binarization threshold
  gapMergeDistance: number; // New: Distance to merge gaps
}

export interface FontOption {
  name: string;
  label: string;
  type: 'script' | 'sans' | 'mono';
}

export const AVAILABLE_FONTS: FontOption[] = [
  { name: 'Neon Script', label: 'Neon Script (Curvy)', type: 'script' },
  { name: 'Simple Script', label: 'Simple Script (Clean)', type: 'script' },
  { name: 'Modern Sans', label: 'Modern Sans (Rounded)', type: 'sans' },
  { name: 'Tech Mono', label: 'Tech Mono (Geometric)', type: 'mono' },
];

export const NEON_COLORS = [
  { name: 'Hot Pink', value: '#FF00FF' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Electric Blue', value: '#2e7bf7' },
  { name: 'Lime Green', value: '#39FF14' },
  { name: 'Orange', value: '#FF4500' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#9D00FF' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Warm White', value: '#FFD700' },
];