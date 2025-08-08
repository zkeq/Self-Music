/**
 * Safari-specific fixes and optimizations
 */

export function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Fix backdrop-filter issues in Safari
 */
export function getOptimizedBackdropFilter(blur: string): Record<string, string | undefined> {
  const isSafariBrowser = isSafari();
  
  return {
    backdropFilter: isSafariBrowser ? `blur(${blur.replace('blur-', '').replace('[', '').replace(']', '').replace('px', '')}px)` : undefined,
    WebkitBackdropFilter: `blur(${blur.replace('blur-', '').replace('[', '').replace(']', '').replace('px', '')}px)`,
    // Fallback for older Safari versions
    filter: isSafariBrowser ? 'none' : undefined,
  };
}

/**
 * Optimize transforms for Safari
 */
export function getSafeTransform(transform: string): string {
  const isSafariBrowser = isSafari();
  
  if (isSafariBrowser) {
    // Ensure hardware acceleration in Safari
    return `${transform} translateZ(0)`;
  }
  
  return transform;
}

/**
 * Get optimized animation properties for Safari
 */
export function getSafariOptimizedAnimation(): Record<string, string | undefined> {
  const isSafariBrowser = isSafari();
  
  if (isSafariBrowser) {
    return {
      transform: 'translateZ(0)', // Force hardware acceleration
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    };
  }
  
  return {
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  };
}

/**
 * Fix scroll performance on iOS Safari
 */
export function getIOSScrollFix(): Record<string, string | undefined> {
  const isIOSDevice = isIOS();
  
  if (isIOSDevice) {
    return {
      WebkitOverflowScrolling: 'touch',
      touchAction: 'manipulation',
    };
  }
  
  return {};
}