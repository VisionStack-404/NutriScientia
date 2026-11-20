import React from 'react';
import { FlaskConical, Leaf } from 'lucide-react';

interface FoodLabLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const FoodLabLogo: React.FC<FoodLabLogoProps> = ({ size = 'md', animated = true }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Animated Scientific Flask with integrated green leaf */}
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/30 ${
          isLg ? 'w-12 h-12' : isSm ? 'w-7 h-7' : 'w-10 h-10'
        } ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}
      >
        <FlaskConical className={`${isLg ? 'w-6 h-6' : isSm ? 'w-3.5 h-3.5' : 'w-5 h-5'} stroke-[2.2]`} />
        {/* Leaf Accent */}
        <div className="absolute -top-1 -right-1 bg-white text-emerald-600 rounded-full p-0.5 shadow-xs ring-1 ring-emerald-200">
          <Leaf className={`${isLg ? 'w-3 h-3' : 'w-2 h-2'} fill-emerald-500`} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight text-slate-900 ${
              isLg ? 'text-xl' : isSm ? 'text-xs' : 'text-base'
            }`}
          >
            FOOD <span className="text-emerald-600">LAB</span>
          </span>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded-xs">
            TM
          </span>
        </div>
        <p className={`text-slate-500 font-medium ${isLg ? 'text-xs' : 'text-[10px]'} leading-tight mt-0.5`}>
          Virtual Food Experimentation Laboratory
        </p>
      </div>
    </div>
  );
};
