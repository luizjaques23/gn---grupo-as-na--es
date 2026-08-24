import React from 'react';
import { cn } from "@/lib/utils";

interface BgradientAnimProps {
  className?: string;
  animationDuration?: number;
}

const BgradientAnim: React.FC<BgradientAnimProps> = ({
  className = "",
}) => {
  return (
    <div className={cn("oklch-gradient-bg w-full h-full pointer-events-none", className)} />
  );
};

export { BgradientAnim };
