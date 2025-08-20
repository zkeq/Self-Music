/**
 * Color extraction and manipulation utilities
 */

export interface ExtractedColor {
  r: number;
  g: number;
  b: number;
  hex: string;
  hsl: [number, number, number];
}

export interface ColorPalette {
  dominant: ExtractedColor;
  accent: ExtractedColor;
  muted: ExtractedColor;
}

/**
 * Extract dominant colors from an image
 */
export function extractColorsFromImage(imageUrl: string): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColors(imageData.data);
        
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Extract dominant colors from image data using balanced color quantization
 */
function extractDominantColors(imageData: Uint8ClampedArray): ColorPalette {
  const colorMap = new Map<string, number>();
  const step = 6; // Balanced step size - not too aggressive (was 8), not too slow (was 4)
  
  // Sample pixels and count colors
  for (let i = 0; i < imageData.length; i += step * 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const alpha = imageData[i + 3];
    
    // Skip transparent pixels
    if (alpha < 128) continue;
    
    // Balanced quantization for better color quality
    const qR = Math.round(r / 32) * 32; // Back to 32 for better color accuracy
    const qG = Math.round(g / 32) * 32;
    const qB = Math.round(b / 32) * 32;
    
    const colorKey = `${qR},${qG},${qB}`;
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
  }
  
  // Get top 8 colors for better variety (compromise between 5 and 10)
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number);
      return { r, g, b };
    });
  
  // More flexible color filtering for better results
  const filteredColors = sortedColors.filter(color => {
    const brightness = (color.r + color.g + color.b) / 3;
    return brightness > 40 && brightness < 210; // Slightly more permissive range
  });
  
  // Enhanced color selection with better fallbacks
  const dominant = filteredColors[0] || { r: 120, g: 120, b: 180 }; // Better default
  const accent = findAccentColor(filteredColors, dominant) || findContrastColor(sortedColors, dominant) || { r: 180, g: 120, b: 160 };
  const muted = findMutedColor(filteredColors) || findSoftColor(sortedColors) || { r: 100, g: 110, b: 130 };
  
  return {
    dominant: createExtractedColor(dominant),
    accent: createExtractedColor(accent),
    muted: createExtractedColor(muted)
  };
}

function findAccentColor(colors: {r: number, g: number, b: number}[], dominant: {r: number, g: number, b: number}) {
  // Find a color that's different enough from the dominant color
  return colors.find(color => {
    const distance = Math.sqrt(
      Math.pow(color.r - dominant.r, 2) +
      Math.pow(color.g - dominant.g, 2) +
      Math.pow(color.b - dominant.b, 2)
    );
    return distance > 80; // Ensure enough contrast
  });
}

// Enhanced contrast color finder
function findContrastColor(colors: {r: number, g: number, b: number}[], dominant: {r: number, g: number, b: number}) {
  return colors.find(color => {
    const distance = Math.sqrt(
      Math.pow(color.r - dominant.r, 2) +
      Math.pow(color.g - dominant.g, 2) +
      Math.pow(color.b - dominant.b, 2)
    );
    return distance > 60; // Slightly lower threshold for more options
  });
}

function findMutedColor(colors: {r: number, g: number, b: number}[]) {
  // Find a more muted (less saturated) version
  return colors.find(color => {
    const saturation = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
    return saturation < 80; // Look for less saturated colors
  });
}

// Enhanced soft color finder
function findSoftColor(colors: {r: number, g: number, b: number}[]) {
  return colors.find(color => {
    const saturation = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
    const brightness = (color.r + color.g + color.b) / 3;
    return saturation < 100 && brightness > 60 && brightness < 180; // Soft, mid-tone colors
  });
}

function createExtractedColor(rgb: {r: number, g: number, b: number}): ExtractedColor {
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    hex,
    hsl
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Generate enhanced default color palette when image is not available
 */
export function getDefaultColorPalette(): ColorPalette {
  return {
    dominant: createExtractedColor({ r: 45, g: 55, b: 72 }), // 深蓝灰色，更加优雅
    accent: createExtractedColor({ r: 99, g: 102, b: 241 }), // 较温和的蓝紫色
    muted: createExtractedColor({ r: 71, g: 85, b: 105 }) // 保持原有的 slate gray
  };
}

/**
 * Create CSS variables for the color palette
 */
export function createColorCSSVariables(palette: ColorPalette): Record<string, string> {
  return {
    '--glow-dominant': palette.dominant.hex,
    '--glow-dominant-rgb': `${palette.dominant.r}, ${palette.dominant.g}, ${palette.dominant.b}`,
    '--glow-accent': palette.accent.hex,
    '--glow-accent-rgb': `${palette.accent.r}, ${palette.accent.g}, ${palette.accent.b}`,
    '--glow-muted': palette.muted.hex,
    '--glow-muted-rgb': `${palette.muted.r}, ${palette.muted.g}, ${palette.muted.b}`
  };
}