'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ColorPalette, extractColorsFromImage, getDefaultColorPalette, createColorCSSVariables } from '@/lib/color-utils';

interface AmbientGlowProps {
  imageUrl?: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

export function AmbientGlow({ 
  imageUrl, 
  className, 
  intensity = 'medium',
  animated = true 
}: AmbientGlowProps) {
  const [colorPalette, setColorPalette] = useState<ColorPalette>(getDefaultColorPalette());
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  useEffect(() => {
    if (imageUrl) {
      extractColorsFromImage(imageUrl)
        .then(palette => {
          setColorPalette(palette);
          setCssVars(createColorCSSVariables(palette));
        })
        .catch(() => {
          // Fallback to default palette
          const defaultPalette = getDefaultColorPalette();
          setColorPalette(defaultPalette);
          setCssVars(createColorCSSVariables(defaultPalette));
        });
    } else {
      const defaultPalette = getDefaultColorPalette();
      setColorPalette(defaultPalette);
      setCssVars(createColorCSSVariables(defaultPalette));
    }
  }, [imageUrl]);

  const intensityConfig = {
    low: { blur: 'blur-3xl', opacity: 'opacity-20', scale: 'scale-150' },
    medium: { blur: 'blur-[80px]', opacity: 'opacity-30', scale: 'scale-[200%]' },
    high: { blur: 'blur-[120px]', opacity: 'opacity-40', scale: 'scale-[250%]' }
  };

  const config = intensityConfig[intensity];

  return (
    <div 
      className={cn("absolute inset-0 overflow-hidden pointer-events-none -z-10", className)}
      style={cssVars}
    >
      {/* Main ambient glow */}
      <motion.div
        className={cn(
          "absolute top-1/2 left-1/2 w-96 h-96 rounded-full",
          config.blur,
          config.opacity,
          config.scale
        )}
        style={{
          background: `radial-gradient(circle, rgb(var(--glow-dominant-rgb, 99, 102, 241)) 0%, rgba(var(--glow-dominant-rgb, 99, 102, 241), 0.5) 30%, transparent 70%)`
        }}
        animate={animated ? {
          x: [-50, -45, -55, -50],
          y: [-50, -55, -45, -50],
          scale: [1, 1.1, 0.9, 1],
        } : { x: -50, y: -50 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Accent glow */}
      <motion.div
        className={cn(
          "absolute top-1/3 right-1/4 w-72 h-72 rounded-full",
          config.blur,
          "opacity-25"
        )}
        style={{
          background: `radial-gradient(circle, rgb(var(--glow-accent-rgb, 168, 85, 247)) 0%, rgba(var(--glow-accent-rgb, 168, 85, 247), 0.3) 40%, transparent 80%)`
        }}
        animate={animated ? {
          x: [0, 10, -5, 0],
          y: [0, -10, 5, 0],
          scale: [1, 0.8, 1.2, 1],
        } : {}}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Muted background glow */}
      <motion.div
        className={cn(
          "absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full",
          config.blur,
          "opacity-15"
        )}
        style={{
          background: `radial-gradient(circle, rgb(var(--glow-muted-rgb, 71, 85, 105)) 0%, rgba(var(--glow-muted-rgb, 71, 85, 105), 0.2) 50%, transparent 90%)`
        }}
        animate={animated ? {
          x: [0, -8, 12, 0],
          y: [0, 8, -12, 0],
          scale: [1, 1.3, 0.7, 1],
        } : {}}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />

      {/* Additional floating orbs for extra ambiance */}
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-24 h-24 rounded-full",
            "blur-2xl opacity-10"
          )}
          style={{
            background: i === 0 
              ? `rgb(var(--glow-dominant-rgb, 99, 102, 241))` 
              : i === 1 
              ? `rgb(var(--glow-accent-rgb, 168, 85, 247))` 
              : `rgb(var(--glow-muted-rgb, 71, 85, 105))`,
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`
          }}
          animate={animated ? {
            x: [0, 20, -10, 0],
            y: [0, -15, 25, 0],
            opacity: [0.1, 0.2, 0.05, 0.1]
          } : {}}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 3
          }}
        />
      ))}
    </div>
  );
}

interface PremiumGlowEffectProps {
  imageUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PremiumGlowEffect({ imageUrl, className, children }: PremiumGlowEffectProps) {
  return (
    <div className={cn("relative", className)}>
      <AmbientGlow imageUrl={imageUrl} intensity="medium" />
      
      {/* Glass morphism backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-background/20 rounded-xl -z-5" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}