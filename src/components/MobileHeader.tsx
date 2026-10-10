import React from 'react';
import { Radio, ShieldCheck } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "Argus Mobile",
  subtitle = "Urban Flood & Hazard Intelligence",
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-2.5 safe-top shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img
            src="/argus-logo.png"
            alt="Argus"
            className="h-7 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 leading-tight">
              {title}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio className="w-2.5 h-2.5 mr-1 text-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldCheck className="w-2.5 h-2.5 mr-1 text-amber-500" />
            <span>Dry-Run</span>
          </div>
        </div>
      </div>
    </header>
  );
};
