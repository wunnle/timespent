import React from 'react';

interface ToolbarProps {
  onAdd: () => void;
}

export const Toolbar = React.memo(({ onAdd }: ToolbarProps) => {
  return (
    <div className="toolbar">
      <div className="toolbar-title">
        <h1>Timespent</h1>
        <p className="toolbar-subtitle">Time trackers for your activities</p>
      </div>
      <button
        onClick={onAdd}
        className="btn btn-primary btn-lg"
        aria-label="Add a new stopwatch"
      >
        ✚&nbsp;&nbsp;Add
      </button>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';
