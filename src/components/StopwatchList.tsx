import React from 'react';
import type { Stopwatch } from '../store/stopwatches';
import { getElapsedMs } from '../store/stopwatches';
import { StopwatchItem } from './StopwatchItem';

interface StopwatchListProps {
  stopwatches: Stopwatch[];
  now: number;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRecolor: (id: string, color: string) => void;
}

export const StopwatchList = React.memo(
  ({
    stopwatches,
    now,
    onStart,
    onStop,
    onReset,
    onDelete,
    onRename,
    onRecolor,
  }: StopwatchListProps) => {
    if (stopwatches.length === 0) {
      return <div className="empty-state">No stopwatches yet. Add one!</div>;
    }

    return (
      <div className="stopwatch-list">
        {stopwatches.map((sw) => (
          <StopwatchItem
            key={sw.id}
            stopwatch={sw}
            elapsed={getElapsedMs(sw, now)}
            onStart={onStart}
            onStop={onStop}
            onReset={onReset}
            onDelete={onDelete}
            onRename={onRename}
            onRecolor={onRecolor}
          />
        ))}
      </div>
    );
  }
);

StopwatchList.displayName = 'StopwatchList';
