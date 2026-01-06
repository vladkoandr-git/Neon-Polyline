import { Point, PathData } from '../types';
import { FONTS, SCRIPT_FONT } from './fontData';

// --- MATH HELPERS ---
const distSq = (p1: Point, p2: Point) => (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
const dist = (p1: Point, p2: Point) => Math.sqrt(distSq(p1, p2));
const sub = (v1: Point, v2: Point) => ({ x: v1.x - v2.x, y: v1.y - v2.y });
const add = (v1: Point, v2: Point) => ({ x: v1.x + v2.x, y: v1.y + v2.y });
const mul = (v: Point, s: number) => ({ x: v.x * s, y: v.y * s });
const dot = (v1: Point, v2: Point) => v1.x * v2.x + v1.y * v2.y;
const normalize = (v: Point) => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
};

// --- IMAGE PROCESSING ---

const traceImageInternal = (imgData: ImageData, width: number, height: number, threshold: number): Uint8Array => {
  const binaryData = new Uint8Array(width * height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const brightness = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    binaryData[i / 4] = brightness > threshold ? 1 : 0;
  }
  return skeletonize(binaryData, width, height);
};

const skeletonize = (data: Uint8Array, width: number, height: number): Uint8Array => {
  const tempData = new Uint8Array(data);
  let pixelsRemoved = true;
  const getPixel = (arr: Uint8Array, x: number, y: number) => (x < 0 || x >= width || y < 0 || y >= height) ? 0 : arr[y * width + x];
  const setPixel = (arr: Uint8Array, x: number, y: number, val: number) => { arr[y * width + x] = val; };

  while (pixelsRemoved) {
    pixelsRemoved = false;
    const markers: Point[] = [];
    for (let iter = 0; iter < 2; iter++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (getPixel(tempData, x, y) === 0) continue;
          const p2 = getPixel(tempData, x, y - 1);
          const p3 = getPixel(tempData, x + 1, y - 1);
          const p4 = getPixel(tempData, x + 1, y);
          const p5 = getPixel(tempData, x + 1, y + 1);
          const p6 = getPixel(tempData, x, y + 1);
          const p7 = getPixel(tempData, x - 1, y + 1);
          const p8 = getPixel(tempData, x - 1, y);
          const p9 = getPixel(tempData, x - 1, y - 1);
          const A = (p2 === 0 && p3 === 1 ? 1 : 0) + (p3 === 0 && p4 === 1 ? 1 : 0) + (p4 === 0 && p5 === 1 ? 1 : 0) + (p5 === 0 && p6 === 1 ? 1 : 0) + (p6 === 0 && p7 === 1 ? 1 : 0) + (p7 === 0 && p8 === 1 ? 1 : 0) + (p8 === 0 && p9 === 1 ? 1 : 0) + (p9 === 0 && p2 === 1 ? 1 : 0);
          const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          let m1 = iter === 0 ? p2 * p4 * p6 : p2 * p4 * p8;
          let m2 = iter === 0 ? p4 * p6 * p8 : p2 * p6 * p8;
          if (A === 1 && (B >= 2 && B <= 6) && m1 === 0 && m2 === 0) markers.push({ x, y });
        }
      }
      if (markers.length > 0) {
        markers.forEach(p => setPixel(tempData, p.x, p.y, 0));
        pixelsRemoved = true;
        markers.length = 0;
      }
    }
  }
  return tempData;
};

const traceSkeleton = (data: Uint8Array, width: number, height: number): Point[][] => {
  const paths: Point[][] = [];
  const visited = new Uint8Array(width * height);
  const getPixel = (x: number, y: number) => (x < 0 || x >= width || y < 0 || y >= height) ? 0 : data[y * width + x];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (getPixel(x, y) === 1 && visited[y * width + x] === 0) {
        const path: Point[] = [];
        let cx = x, cy = y;
        path.push({ x: cx, y: cy });
        visited[cy * width + cx] = 1;
        let tracing = true;
        while (tracing) {
          tracing = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx, ny = cy + dy;
              if (getPixel(nx, ny) === 1 && visited[ny * width + nx] === 0) {
                cx = nx; cy = ny;
                path.push({ x: cx, y: cy });
                visited[ny * width + nx] = 1;
                tracing = true;
                break;
              }
            }
            if (tracing) break;
          }
        }
        if (path.length > 3) paths.push(path);
      }
    }
  }
  return paths;
};

// --- FONT PARSING ---
const parsePath = (pathString: string, offsetX: number, offsetY: number, scale: number): Point[][] => {
  const parts = pathString.split(' ');
  const paths: Point[][] = [];
  let currentPath: Point[] = [];
  let i = 0;
  while (i < parts.length) {
    const cmd = parts[i];
    if (cmd === 'M' || cmd === 'L') {
      if (cmd === 'M' && currentPath.length > 0) { paths.push(currentPath); currentPath = []; }
      currentPath.push({ x: parseFloat(parts[i + 1]) * scale + offsetX, y: parseFloat(parts[i + 2]) * scale + offsetY });
      i += 3;
    } else if (cmd === 'Q') {
       // Quadratic to points approximation
       const last = currentPath[currentPath.length - 1];
       const cx = parseFloat(parts[i+1]) * scale + offsetX;
       const cy = parseFloat(parts[i+2]) * scale + offsetY;
       const ex = parseFloat(parts[i+3]) * scale + offsetX;
       const ey = parseFloat(parts[i+4]) * scale + offsetY;
       const steps = 5;
       for(let t=1; t<=steps; t++) {
           const T = t/steps;
           const invT = 1-T;
           currentPath.push({
               x: invT*invT*last.x + 2*invT*T*cx + T*T*ex,
               y: invT*invT*last.y + 2*invT*T*cy + T*T*ey
           });
       }
       i += 5;
    } else i++;
  }
  if (currentPath.length > 0) paths.push(currentPath);
  return paths;
};

// --- HEALING / MERGING ---
const healPaths = (pathLists: Point[][], tolerance: number): Point[][] => {
  if (tolerance <= 0) return pathLists;
  let lists = pathLists.map(p => [...p]);
  let changed = true;
  const tolSq = tolerance * tolerance;

  while (changed) {
    changed = false;
    for (let i = 0; i < lists.length; i++) {
      if (!lists[i]) continue;
      for (let j = 0; j < lists.length; j++) {
        if (i === j || !lists[j]) continue;

        const pathA = lists[i];
        const pathB = lists[j];
        
        const headA = pathA[0];
        const tailA = pathA[pathA.length - 1];
        const headB = pathB[0];
        const tailB = pathB[pathB.length - 1];

        if (distSq(tailA, headB) < tolSq) {
          lists[i] = pathA.concat(pathB);
          lists[j] = null as any;
          changed = true;
          break;
        } else if (distSq(tailA, tailB) < tolSq) {
           lists[i] = pathA.concat(pathB.reverse());
           lists[j] = null as any;
           changed = true;
           break;
        } else if (distSq(headA, headB) < tolSq) {
            lists[i] = pathB.reverse().concat(pathA);
            lists[j] = null as any;
            changed = true;
            break;
        } else if (distSq(headA, tailB) < tolSq) {
            lists[i] = pathB.concat(pathA);
            lists[j] = null as any;
            changed = true;
            break;
        }
      }
      if (changed) break;
    }
    lists = lists.filter(l => l !== null);
  }
  return lists;
};

// --- SIMPLIFICATION ---
const simplifyPathRDP = (points: Point[], epsilon: number): Point[] => {
  if (points.length < 3) return points;
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) { index = i; dmax = d; }
  }
  if (dmax > epsilon) {
    const res1 = simplifyPathRDP(points.slice(0, index + 1), epsilon);
    const res2 = simplifyPathRDP(points.slice(index), epsilon);
    return res1.slice(0, res1.length - 1).concat(res2);
  } else {
    return [points[0], points[end]];
  }
};
const perpendicularDistance = (p: Point, lineStart: Point, lineEnd: Point) => {
  let dx = lineEnd.x - lineStart.x;
  let dy = lineEnd.y - lineStart.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag > 0) { dx /= mag; dy /= mag; }
  const pvx = p.x - lineStart.x, pvy = p.y - lineStart.y;
  const pvdot = pvx * dx + pvy * dy;
  return Math.sqrt((pvx - pvdot * dx) ** 2 + (pvy - pvdot * dy) ** 2);
};

// --- CURVE FITTING (SCHNEIDER ALGORITHM) ---
const fitCubic = (points: Point[], error: number): string => {
  if (points.length < 2) return "";
  const len = points.length;
  const tHat1 = normalize(sub(points[1], points[0]));
  const tHat2 = normalize(sub(points[len - 2], points[len - 1]));
  const resultCommands: string[] = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];
  fitCubicRecursive(points, tHat1, tHat2, error, resultCommands);
  return resultCommands.join(" ");
};

const fitCubicRecursive = (points: Point[], tHat1: Point, tHat2: Point, error: number, commands: string[]) => {
  if (points.length === 2) {
    const p0 = points[0];
    const p3 = points[1];
    const dist = Math.sqrt(distSq(p0, p3)) / 3;
    const p1 = add(p0, mul(tHat1, dist));
    const p2 = add(p3, mul(tHat2, dist));
    commands.push(`C ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}, ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`);
    return;
  }
  let u = [0];
  for (let i = 1; i < points.length; i++) {
    u.push(u[i - 1] + dist(points[i], points[i - 1]));
  }
  const totalLen = u[u.length - 1];
  u = u.map(v => v / totalLen);
  let bezCurve = generateBezier(points, u, tHat1, tHat2);
  let maxError = 0;
  let splitPoint = 0;
  for (let i = 0; i < points.length; i++) {
     const p = points[i];
     const c = evaluateBezier(bezCurve, u[i]);
     const err = distSq(p, c);
     if (err > maxError) { maxError = err; splitPoint = i; }
  }
  if (maxError < error * error) {
      const p1 = bezCurve[1];
      const p2 = bezCurve[2];
      const p3 = bezCurve[3];
      commands.push(`C ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}, ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`);
  } else {
      if (splitPoint === 0 || splitPoint === points.length - 1) { splitPoint = Math.floor(points.length / 2); }
      const centerTangent = normalize(sub(points[splitPoint - 1], points[splitPoint + 1]));
      const centerTangentRev = { x: -centerTangent.x, y: -centerTangent.y }; 
      fitCubicRecursive(points.slice(0, splitPoint + 1), tHat1, centerTangent, error, commands);
      fitCubicRecursive(points.slice(splitPoint), centerTangentRev, tHat2, error, commands);
  }
};

const generateBezier = (points: Point[], u: number[], t1: Point, t2: Point): Point[] => {
    const first = points[0];
    const last = points[points.length - 1];
    let C = [[0, 0], [0, 0]];
    let X = [0, 0];
    for (let i = 0; i < points.length; i++) {
        const t = u[i];
        const t2_ = t * t;
        const t3 = t2_ * t;
        const invT = 1 - t;
        const invT2 = invT * invT;
        const invT3 = invT2 * invT;
        const b0 = invT3;
        const b1 = 3 * invT2 * t;
        const b2 = 3 * invT * t2_;
        const b3 = t3;
        const a1 = mul(t1, b1);
        const a2 = mul(t2, b2);
        const pTerm = add(mul(first, b0 + b1), mul(last, b2 + b3));
        const diff = sub(points[i], pTerm);
        C[0][0] += dot(a1, a1);
        C[0][1] += dot(a1, a2);
        C[1][0] += dot(a1, a2);
        C[1][1] += dot(a2, a2);
        X[0] += dot(diff, a1);
        X[1] += dot(diff, a2);
    }
    const det = C[0][0] * C[1][1] - C[1][0] * C[0][1];
    let alpha1 = 0, alpha2 = 0;
    if (Math.abs(det) > 1e-5) {
        alpha1 = (X[0] * C[1][1] - X[1] * C[0][1]) / det;
        alpha2 = (C[0][0] * X[1] - C[1][0] * X[0]) / det;
    }
    const dist = Math.sqrt(distSq(first, last));
    if (alpha1 < 1e-5 || alpha1 > dist * 3) alpha1 = dist / 3;
    if (alpha2 < 1e-5 || alpha2 > dist * 3) alpha2 = dist / 3;
    return [first, add(first, mul(t1, alpha1)), add(last, mul(t2, alpha2)), last];
};

const evaluateBezier = (bez: Point[], t: number): Point => {
    const invT = 1 - t;
    const b0 = invT * invT * invT;
    const b1 = 3 * invT * invT * t;
    const b2 = 3 * invT * t * t;
    const b3 = t * t * t;
    return {
        x: b0 * bez[0].x + b1 * bez[1].x + b2 * bez[2].x + b3 * bez[3].x,
        y: b0 * bez[0].y + b1 * bez[1].y + b2 * bez[2].y + b3 * bez[3].y
    };
};

const processPaths = (rawPaths: Point[][], smoothing: number, mergeDist: number): PathData[] => {
    const healedPaths = healPaths(rawPaths, mergeDist > 0 ? mergeDist : 0.1);
    const rdpEpsilon = 0.5 + (smoothing / 20); 
    const curveError = 1.0 + (smoothing / 10);
    return healedPaths.map(pts => {
        const simplified = simplifyPathRDP(pts, rdpEpsilon);
        const bezierPath = fitCubic(simplified, curveError);
        return { points: simplified, path: bezierPath };
    });
};

// --- WEB FONT TRACING (New) ---
const generateCenterlineFromWebFont = async (
    text: string, 
    fontName: string, 
    width: number, 
    height: number, 
    fontSize: number,
    smoothingAmount: number,
    mergeDistance: number
): Promise<PathData[]> => {
    // Force load the font first
    try {
        await document.fonts.load(`${fontSize}px "${fontName}"`);
    } catch (e) {
        console.warn('Font load warning:', e);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Draw white text on black background for contrast
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px "${fontName}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Skeletonize
    const binary = traceImageInternal(ctx.getImageData(0, 0, width, height), width, height, 128);
    const rawPaths = traceSkeleton(binary, width, height);
    
    // Process
    return processPaths(rawPaths, smoothingAmount, mergeDistance);
};

// --- MAIN EXPORT ---
export const generateCenterline = async (
  text: string, 
  fontName: string, 
  targetWidth: number, 
  targetHeight: number,
  fontSize: number,
  smoothingAmount: number = 20,
  mergeDistance: number = 0
): Promise<PathData[]> => {
  return new Promise(async (resolve) => {
      // Check if it is a built-in vector font
      if (FONTS[fontName as keyof typeof FONTS]) {
        setTimeout(() => {
            const font = FONTS[fontName as keyof typeof FONTS];
            const scale = fontSize / 30; 
            let cursorX = 50; 
            const startY = targetHeight / 2;
            let allPaths: Point[][] = [];
    
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char === ' ') { cursorX += 20 * scale; continue; }
                const glyph = font[char] || font[char.toLowerCase()] || font['?'];
                if (!glyph) { cursorX += 15 * scale; continue; }
    
                const spacing = (fontName.includes('Script')) ? 2 * scale : 5 * scale;
                const charPaths = parsePath(glyph.d, cursorX, startY, scale);
                allPaths.push(...charPaths);
                cursorX += glyph.w * scale + spacing;
            }
            resolve(processPaths(allPaths, smoothingAmount, mergeDistance));
        }, 50);
      } else {
        // It's a web font, use tracing
        const paths = await generateCenterlineFromWebFont(
            text, 
            fontName, 
            targetWidth, 
            targetHeight, 
            fontSize, 
            smoothingAmount, 
            mergeDistance
        );
        resolve(paths);
      }
  });
};

export const generateCenterlineFromImage = async (
    imageUrl: string,
    width: number,
    height: number,
    threshold: number,
    smoothingAmount: number,
    mergeDistance: number = 0
): Promise<PathData[]> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if(!ctx) return reject('No context');

            // Draw and fit image
            const scale = Math.min(width / img.width, height / img.height);
            const x = (width - img.width * scale) / 2;
            const y = (height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            const binary = traceImageInternal(ctx.getImageData(0, 0, width, height), width, height, threshold);
            const rawPaths = traceSkeleton(binary, width, height);

            resolve(processPaths(rawPaths, smoothingAmount, mergeDistance));
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
};
