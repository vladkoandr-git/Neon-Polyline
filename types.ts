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
  type: 'script' | 'sans' | 'mono' | 'hand';
  category: 'manual' | 'web'; // 'manual' = built-in vector, 'web' = google font to be traced
}

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

// Helper to create web font options quickly
const webFont = (name: string, type: FontOption['type'] = 'script'): FontOption => ({
  name,
  label: name,
  type,
  category: 'web'
});

export const AVAILABLE_FONTS: FontOption[] = [
  // --- MANUAL VECTOR FONTS (Best for CNC) ---
  { name: 'Neon Script', label: 'Neon Script (Optimized)', type: 'script', category: 'manual' },
  { name: 'Vintage Script', label: 'Vintage Script (Ornate)', type: 'script', category: 'manual' },
  { name: 'Signature', label: 'Signature (Loose)', type: 'script', category: 'manual' },
  { name: 'Simple Script', label: 'Simple Script (Clean)', type: 'script', category: 'manual' },
  { name: 'Modern Sans', label: 'Modern Sans (Rounded)', type: 'sans', category: 'manual' },
  { name: 'Tech Mono', label: 'Tech Mono (Geometric)', type: 'mono', category: 'manual' },

  // --- WEB FONTS (Traced on the fly) ---
  webFont('Alex Brush'),
  webFont('Allura'),
  webFont('Arizonia'),
  webFont('Bad Script', 'hand'),
  webFont('Bilbo'),
  webFont('Black Jack'),
  webFont('Caveat', 'hand'),
  webFont('Cedarville Cursive'),
  webFont('Clicker Script'),
  webFont('Comfortaa', 'sans'),
  webFont('Cookie'),
  webFont('Courgette'),
  webFont('Covered By Your Grace', 'hand'),
  webFont('Damion'),
  webFont('Dancing Script'),
  webFont('Delius', 'hand'),
  webFont('Dr Sugiyama'),
  webFont('Euphoria Script'),
  webFont('Felipa'),
  webFont('Fondamento'),
  webFont('Give You Glory', 'hand'),
  webFont('Gloria Hallelujah', 'hand'),
  webFont('Grand Hotel'),
  webFont('Great Vibes'),
  webFont('Herr Von Muellerhoff'),
  webFont('Homemade Apple'),
  webFont('Indie Flower', 'hand'),
  webFont('Italianno'),
  webFont('Jim Nightshade'),
  webFont('Kaushan Script'),
  webFont('Kristi'),
  webFont('La Belle Aurore', 'hand'),
  webFont('League Script'),
  webFont('Leckerli One'),
  webFont('Marck Script'),
  webFont('Meddon'),
  webFont('Meie Script'),
  webFont('Miss Fajardose'),
  webFont('Monsieur La Doulaise'),
  webFont('Montez'),
  webFont('Montserrat', 'sans'),
  webFont('Mr Bedfort'),
  webFont('Mr Dafoe'),
  webFont('Mr De Haviland'),
  webFont('Mrs Saint Delafield'),
  webFont('Neucha', 'hand'),
  webFont('Norican'),
  webFont('Nothing You Could Do', 'hand'),
  webFont('Over the Rainbow', 'hand'),
  webFont('Pacifico'),
  webFont('Parisienne'),
  webFont('Patrick Hand', 'hand'),
  webFont('Petit Formal Script'),
  webFont('Pinyon Script'),
  webFont('Playball'),
  webFont('Quintessential'),
  webFont('Reenie Beanie', 'hand'),
  webFont('Rochester'),
  webFont('Rock Salt', 'hand'),
  webFont('Rouge Script'),
  webFont('Ruthie'),
  webFont('Sacramento'),
  webFont('Satisfy'),
  webFont('Schoolbell', 'hand'),
  webFont('Seaweed Script'),
  webFont('Send Flowers'),
  webFont('Shadows Into Light', 'hand'),
  webFont('Tangerine'),
  webFont('The Girl Next Door', 'hand'),
  webFont('Vibur'),
  webFont('Waiting for the Sunrise', 'hand'),
  webFont('WindSong'),
  webFont('Yellowtail'),
  webFont('Yesteryear'),
  webFont('Zeyada'),
];