'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlayerLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PlayerLayout({ children, className }: PlayerLayoutProps) {
  return (
    <div className={cn("flex-1 flex items-center justify-center h-full p-4 lg:p-6 xl:p-8 2xl:p-12 3xl:p-16", className)}>
      <div className="w-full max-w-6xl xl:max-w-7xl 2xl:max-w-8xl flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-12">
        {children}
      </div>
    </div>
  );
}

interface PlayerSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PlayerLeftSection({ children, className }: PlayerSectionProps) {
  return (
    <div className={cn(
      "flex-1 flex flex-col items-center justify-center space-y-4 lg:space-y-6",
      className
    )}>
      {children}
    </div>
  );
}

export function PlayerRightSection({ children, className }: PlayerSectionProps) {
  return (
    <div className={cn(
      "flex-1 flex flex-col items-center justify-center",
      className
    )}>
      {children}
    </div>
  );
}

interface PlayerCardProps {
  children: React.ReactNode;
  className?: string;
  glassEffect?: boolean;
}

export function PlayerCard({ children, className, glassEffect = false }: PlayerCardProps) {
  return (
    <Card className={cn(
      "p-4 lg:p-6 transition-all duration-500",
      glassEffect && "bg-background/60 backdrop-blur-lg border-white/20",
      className
    )}>
      {children}
    </Card>
  );
}