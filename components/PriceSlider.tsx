'use client';

import { Range, getTrackBackground } from 'react-range';
import React from 'react';

type Props = {
  min: number;
  max: number;
  step: number;
  values: number[];
  onChange: (values: number[]) => void;
  unit?: string;
};

export default function PriceSlider({
  min,
  max,
  step,
  values,
  onChange,
  unit = '€',
}: Props) {
  return (
    <div className="w-full px-2 py-4">
      <Range
        values={values}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            className="h-6 flex w-full"
          >
            <div
              ref={props.ref}
              className="h-2 w-full rounded-full"
              style={{
                background: getTrackBackground({
                  values,
                  colors: ['#1C1F26', '#0CE49B', '#1C1F26'],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, index }) => (
          <div
            {...props}
            className="h-5 w-5 rounded-full bg-opnskin-accent shadow-lg flex items-center justify-center border-2 border-opnskin-bg-primary/20 hover:shadow-[0_0_10px_rgba(12,228,155,0.3)] transition-shadow"
          >
            <div
              className="absolute -top-7 text-xs font-mono text-opnskin-text-primary bg-opnskin-bg-card px-2 py-1 rounded shadow-md border border-opnskin-bg-secondary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {unit}
              {values[index].toFixed(0)}
            </div>
          </div>
        )}
      />
    </div>
  );
}
