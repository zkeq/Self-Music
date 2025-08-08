'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ColorPalette, extractColorsFromImage, getDefaultColorPalette, createColorCSSVariables } from '@/lib/color-utils';
import { getSafariOptimizedAnimation, getSafeTransform } from '@/lib/safari-fixes';

interface AmbientGlowProps {
  imageUrl?: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  enableColorExtraction?: boolean; // New prop to disable expensive color extraction
}

export function AmbientGlow({ 
  imageUrl, 
  className, 
  intensity = 'medium',
  animated = true,
  enableColorExtraction = true
}: AmbientGlowProps) {
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  
  // Memoize CSS variables to prevent recalculation
  const cssVars = useMemo(() => {
    return colorPalette ? createColorCSSVariables(colorPalette) : {};
  }, [colorPalette]);

  // Debounce color extraction for performance
  const extractColors = useCallback(async (url: string) => {
    if (!enableColorExtraction) {
      const defaultPalette = getDefaultColorPalette();
      setColorPalette(defaultPalette);
      return;
    }

    try {
      const palette = await extractColorsFromImage(url);
      setColorPalette(palette);
    } catch {
      const defaultPalette = getDefaultColorPalette();
      setColorPalette(defaultPalette);
    }
  }, [enableColorExtraction]);

  useEffect(() => {
    if (imageUrl) {
      extractColors(imageUrl);
    } else {
      const defaultPalette = getDefaultColorPalette();
      setColorPalette(defaultPalette);
    }
  }, [imageUrl, extractColors]);

  // Don't render until we have a color palette to avoid hydration mismatch
  if (!colorPalette) {
    return null;
  }

  const intensityConfig = {
    low: { blur: 'blur-2xl', opacity: 'opacity-15', scale: 'scale-125' },
    medium: { blur: 'blur-[60px]', opacity: 'opacity-25', scale: 'scale-[175%]' }, // Enhanced for better visual impact
    high: { blur: 'blur-[80px]', opacity: 'opacity-35', scale: 'scale-[200%]' } // Restored some intensity
  };

  const config = intensityConfig[intensity];
  
  // Get Safari-optimized animation styles
  const safariAnimationStyles = getSafariOptimizedAnimation();

  return (
    <div 
      className={cn("absolute inset-0 overflow-hidden pointer-events-none -z-10", className)}
      style={cssVars}
    >
      {/* Main ambient glow - optimized with will-change */}
      <motion.div
        className={cn(
          "absolute top-1/2 left-1/2 w-96 h-96 rounded-full",
          config.blur,
          config.opacity,
          config.scale
        )}
        style={{
          background: `radial-gradient(circle, rgb(var(--glow-dominant-rgb, 99, 102, 241)) 0%, rgba(var(--glow-dominant-rgb, 99, 102, 241), 0.5) 30%, transparent 70%)`,
          ...safariAnimationStyles
        }}
        animate={animated ? {
          x: [-50, -45, -55, -50],
          y: [-50, -55, -45, -50],
          scale: [1, 1.05, 0.95, 1], // Reduced scale animation range
        } : { x: -50, y: -50 }}
        transition={{
          duration: 12, // Increased duration for smoother animation
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Simplified accent glow - enhanced visual */}
      {animated && (
        <motion.div
          className={cn(
            "absolute top-1/3 right-1/4 w-80 h-80 rounded-full", // Restored size
            config.blur,
            "opacity-20" // Increased opacity for better visual impact
          )}
          style={{
            background: `radial-gradient(circle, rgb(var(--glow-accent-rgb, 236, 72, 153)) 0%, rgba(var(--glow-accent-rgb, 236, 72, 153), 0.4) 40%, transparent 80%)`,
            ...safariAnimationStyles
          }}
          animate={{
            x: [0, 12, -6, 0], // Slightly increased movement
            y: [0, -12, 6, 0],
            scale: [1, 0.85, 1.15, 1], // Enhanced scale animation
          }}
          transition={{
            duration: 14, // Balanced speed
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      )}

      {/* Add back a subtle third glow for depth - performance optimized */}
      {animated && (
        <motion.div
          className={cn(
            "absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full",
            "blur-[40px]", // Moderate blur
            "opacity-10" // Very subtle
          )}
          style={{
            background: `radial-gradient(circle, rgb(var(--glow-muted-rgb, 71, 85, 105)) 0%, rgba(var(--glow-muted-rgb, 71, 85, 105), 0.3) 50%, transparent 90%)`,
            ...safariAnimationStyles
          }}
          animate={{
            x: [0, -6, 8, 0],
            y: [0, 6, -8, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 20, // Very slow for subtle effect
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />
      )}
    </div>
  );
}

interface PremiumGlowEffectProps {
  imageUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PremiumGlowEffect({ imageUrl, className, children }: PremiumGlowEffectProps) {
  const safariAnimationStyles = getSafariOptimizedAnimation();
  
  return (
    <div className={cn("relative", className)}>
      <AmbientGlow imageUrl={imageUrl} intensity="medium" enableColorExtraction={true} />
      
      {/* Glass morphism backdrop - optimized for Safari */}
      <div 
        className="absolute inset-0 bg-background/20 rounded-xl -z-5" 
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          ...safariAnimationStyles
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}