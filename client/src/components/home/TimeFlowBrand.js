import React from 'react';

const TimeFlowMark = ({ compact = false }) => (
  <span
    className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/20 ${
      compact ? 'h-10 w-10' : 'h-12 w-12'
    }`}
    aria-hidden="true"
  >
    <span className="absolute inset-[4px] rounded-full bg-white/95 dark:bg-slate-950" />
    <span className={`relative rounded-full border-[3px] border-cyan-500 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`}>
      <span className="absolute -right-[7px] -top-[7px] h-[12px] w-[3px] rotate-45 rounded-full bg-emerald-400" />
    </span>
  </span>
);

const TimeFlowBrand = ({ compact = false, inverted = false }) => (
  <div className="inline-flex items-center gap-3">
    <TimeFlowMark compact={compact} />
    <div>
      <div
        className={`bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 bg-clip-text font-extrabold tracking-tight text-transparent ${
          compact ? 'text-xl' : 'text-2xl'
        }`}
      >
        TimeFlow
      </div>
      {!compact && (
        <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${inverted ? 'text-white/65' : 'text-slate-500 dark:text-slate-400'}`}>
          Seu tempo no controle
        </div>
      )}
    </div>
  </div>
);

export default TimeFlowBrand;
