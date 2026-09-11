'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { FluidCoverCanvas } from '@/components/fluid-cover-canvas';
import {
  ColorPalette,
  createColorCSSVariables,
  extractColorsFromImage,
  getDefaultColorPalette,
} from '@/lib/color-utils';

interface AmbientGlowProps {
  imageUrl?: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  enableColorExtraction?: boolean;
}

function gradeColorForAmbient(
  color: ColorPalette['dominant'],
  lightnessRange: [number, number],
) {
  const [hue, saturation, lightness] = color.hsl;
  const gradedSaturation = Math.min(82, Math.max(46, saturation * 1.45));
  const gradedLightness = Math.min(
    lightnessRange[1],
    Math.max(lightnessRange[0], lightness * 0.68),
  );

  return `${hue}, ${Math.round(gradedSaturation)}%, ${Math.round(gradedLightness)}%`;
}

/**
 * A full-viewport colour field derived from the current cover artwork.
 * The oversized layers extend outside the viewport so the motion reads as a
 * slow wash of light instead of separate floating circles.
 */
export function AmbientGlow({
  imageUrl,
  className,
  intensity = 'medium',
  animated = true,
  enableColorExtraction = true,
}: AmbientGlowProps) {
  const [colorPalette, setColorPalette] = useState<ColorPalette>(getDefaultColorPalette());

  const extractColors = useCallback(async (url: string) => {
    if (!enableColorExtraction) {
      setColorPalette(getDefaultColorPalette());
      return;
    }

    try {
      setColorPalette(await extractColorsFromImage(url));
    } catch (error) {
      // Retain the previous palette so an unavailable cover does not flash the
      // player back to its default colours.
      console.warn('Failed to extract colors from image, keeping current palette:', error);
    }
  }, [enableColorExtraction]);

  useEffect(() => {
    if (imageUrl) void extractColors(imageUrl);
  }, [imageUrl, extractColors]);

  const style = useMemo(() => ({
    ...createColorCSSVariables(colorPalette),
    '--ambient-dominant': gradeColorForAmbient(colorPalette.dominant, [30, 43]),
    '--ambient-accent': gradeColorForAmbient(colorPalette.accent, [38, 52]),
    '--ambient-muted': gradeColorForAmbient(colorPalette.muted, [24, 36]),
  }) as React.CSSProperties, [colorPalette]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'ambient-glow',
        `ambient-glow--${intensity}`,
        animated && 'ambient-glow--animated',
        className,
      )}
      style={style}
    >
      <div className="ambient-glow__wash ambient-glow__wash--primary" />
      <div className="ambient-glow__wash ambient-glow__wash--accent" />
      <div className="ambient-glow__wash ambient-glow__wash--soft" />
      <div className="ambient-glow__bloom" />
      <FluidCoverCanvas imageUrl={imageUrl} animated={animated} />
      <div className="ambient-glow__veil" />
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
    <div className={cn('relative isolate', className)}>
      <AmbientGlow imageUrl={imageUrl} intensity="medium" className="absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-[5] rounded-xl bg-background/20 backdrop-blur-lg" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
