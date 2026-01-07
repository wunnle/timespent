import React from 'react';
import type { Stopwatch } from '../store/stopwatches';
import { formatTime, getContrastColor } from '../utils/format';
import { COLOR_PALETTE, COLOR_NAMES } from '../utils/colors';

interface StopwatchItemProps {
  stopwatch: Stopwatch;
  elapsed: number;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRecolor: (id: string, color: string) => void;
}

export const StopwatchItem = React.memo(
  ({
    stopwatch,
    elapsed,
    onStart,
    onStop,
    onReset,
    onDelete,
    onRename,
    onRecolor,
  }: StopwatchItemProps) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editName, setEditName] = React.useState(stopwatch.name);
    const [showColorPicker, setShowColorPicker] = React.useState(false);
    const colorPickerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          showColorPicker &&
          colorPickerRef.current &&
          !colorPickerRef.current.contains(event.target as Node)
        ) {
          setShowColorPicker(false);
        }
      };

      if (showColorPicker) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showColorPicker]);

    const handleNameSave = () => {
      if (editName.trim()) {
        onRename(stopwatch.id, editName.trim());
        setIsEditing(false);
      }
    };

    const handleNameCancel = () => {
      setEditName(stopwatch.name);
      setIsEditing(false);
    };

    const textColor = getContrastColor(stopwatch.color);

    const darkenColor = (hex: string, percent: number = 20): string => {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.max(0, ((num >> 16) * (100 - percent)) / 100);
      const g = Math.max(0, (((num >> 8) & 0x00ff) * (100 - percent)) / 100);
      const b = Math.max(0, ((num & 0x0000ff) * (100 - percent)) / 100);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const buttonColor = darkenColor(stopwatch.color, 15);
    const buttonHoverColor = darkenColor(stopwatch.color, 25);
    const buttonTextColor = getContrastColor(buttonColor);

    return (
      <div
        className="stopwatch-item"
        style={{
          backgroundColor: stopwatch.color,
          color: textColor,
        }}
      >
        <button
          className="stopwatch-color-indicator"
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{
            backgroundColor: stopwatch.color,
            borderColor: `${textColor}40`,
            display: isEditing ? 'none' : 'flex',
          }}
          aria-label={`Change color for ${stopwatch.name}`}
          aria-expanded={showColorPicker}
        />
        {showColorPicker && (
          <div className="color-palette" ref={colorPickerRef}>
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                className={`color-swatch ${
                  color === stopwatch.color ? 'active' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onRecolor(stopwatch.id, color);
                  setShowColorPicker(false);
                }}
                aria-label={`Select color ${COLOR_NAMES[color]}`}
                data-color-name={COLOR_NAMES[color]}
              />
            ))}
          </div>
        )}
        <div className="stopwatch-header">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') handleNameCancel();
              }}
              autoFocus
              className="stopwatch-name-input"
              style={{
                '--selection-color': stopwatch.color,
                '--selection-text-color': textColor,
              } as React.CSSProperties}
            />
          ) : (
            <h3
              className="stopwatch-name"
              onClick={() => setIsEditing(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsEditing(true);
                }
              }}
            >
              {stopwatch.name}
            </h3>
          )}
        </div>

        <div className="stopwatch-time">{formatTime(elapsed)}</div>

        <div className="stopwatch-controls">
          {!stopwatch.isRunning ? (
            <button
              onClick={() => onStart(stopwatch.id)}
              className="btn btn-icon"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: 'currentColor',
              }}
              aria-label={`Start ${stopwatch.name}`}
              title="Start"
            >
              ▶
            </button>
          ) : (
            <button
              onClick={() => onStop(stopwatch.id)}
              className="btn btn-icon"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: 'currentColor',
              }}
              aria-label={`Pause ${stopwatch.name}`}
              title="Pause"
            >
              ⏸
            </button>
          )}
          <button
            onClick={() => onReset(stopwatch.id)}
            className="btn btn-icon"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: 'currentColor',
            }}
            aria-label={`Reset ${stopwatch.name}`}
            title="Reset"
          >
            ⏹
          </button>
          <button
            onClick={() => onDelete(stopwatch.id)}
            className="btn btn-delete"
            aria-label={`Delete ${stopwatch.name}`}
          >
            ✖
          </button>
        </div>
      </div>
    );
  }
);

StopwatchItem.displayName = 'StopwatchItem';
