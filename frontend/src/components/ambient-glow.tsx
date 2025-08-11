'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ColorPalette, extractColorsFromImage, getDefaultColorPalette, createColorCSSVariables } from '@/lib/color-utils';
import { getSafariOptimizedAnimation } from '@/lib/safari-fixes';

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
    low: { blur: 'blur-2xl', opacity: 'opacity-20', scale: 'scale-150' },
    medium: { blur: 'blur-[60px]', opacity: 'opacity-40', scale: 'scale-[225%]' }, // Significantly increased opacity and scale
    high: { blur: 'blur-[80px]', opacity: 'opacity-50', scale: 'scale-[275%]' } // Maximum visual impact
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
          background: `radial-gradient(circle, rgb(var(--glow-dominant-rgb, 139, 92, 246)) 0%, rgba(var(--glow-dominant-rgb, 139, 92, 246), 0.7) 25%, rgba(var(--glow-dominant-rgb, 139, 92, 246), 0.4) 50%, transparent 75%)`,
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

      {/* Enhanced accent glow for better visibility */}
      {animated ? (
        <motion.div
          className={cn(
            "absolute top-1/3 right-1/4 w-96 h-96 rounded-full", // Increased size
            config.blur,
            "opacity-30" // Increased opacity significantly
          )}
          style={{
            background: `radial-gradient(circle, rgb(var(--glow-accent-rgb, 236, 72, 153)) 0%, rgba(var(--glow-accent-rgb, 236, 72, 153), 0.6) 30%, rgba(var(--glow-accent-rgb, 236, 72, 153), 0.3) 60%, transparent 85%)`,
            ...safariAnimationStyles
          }}
          animate={{
            x: [0, 15, -8, 0], // Increased movement for more dynamic effect
            y: [0, -15, 8, 0],
            scale: [1, 0.8, 1.2, 1], // More dramatic scaling
          }}
          transition={{
            duration: 13, // Slightly faster for more liveliness
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      ) : (
        // Static accent glow when animation is disabled
        <div
          className={cn(
            "absolute top-1/3 right-1/4 w-96 h-96 rounded-full",
            config.blur,
            "opacity-25"
          )}
          style={{
            background: `radial-gradient(circle, rgb(var(--glow-accent-rgb, 236, 72, 153)) 0%, rgba(var(--glow-accent-rgb, 236, 72, 153), 0.5) 30%, rgba(var(--glow-accent-rgb, 236, 72, 153), 0.2) 60%, transparent 85%)`,
            ...safariAnimationStyles
          }}
        />
      )}

      {/* Enhanced third glow for depth and ambiance */}
      {animated && (
        <motion.div
          className={cn(
            "absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full", // Increased size
            "blur-[50px]", // Moderate blur
            "opacity-15" // Increased opacity
          )}
          style={{
            background: `radial-gradient(circle, rgb(var(--glow-muted-rgb, 71, 85, 105)) 0%, rgba(var(--glow-muted-rgb, 71, 85, 105), 0.5) 40%, rgba(var(--glow-muted-rgb, 71, 85, 105), 0.2) 70%, transparent 95%)`,
            ...safariAnimationStyles
          }}
          animate={{
            x: [0, -10, 12, 0], // Increased movement
            y: [0, 10, -12, 0],
            scale: [1, 1.3, 0.7, 1], // More dynamic scaling
          }}
          transition={{
            duration: 18, // Slower for subtle depth effect
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
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