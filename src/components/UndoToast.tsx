import React, { useEffect, useState } from 'react';

interface UndoToastProps {
  message: string | null;
  onUndo: () => void;
  ttlMs?: number;
}

export const UndoToast = React.memo(
  ({ message, onUndo, ttlMs = 5000 }: UndoToastProps) => {
    const [remaining, setRemaining] = useState(ttlMs);
    const [isVisible, setIsVisible] = useState(!!message);

    useEffect(() => {
      if (!message) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);
      setRemaining(ttlMs);

      const interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 100) {
            setIsVisible(false);
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(interval);
    }, [message, ttlMs]);

    if (!isVisible || !message) return null;

    const percentRemaining = (remaining / ttlMs) * 100;

    return (
      <div
        className="undo-toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span>{message}</span>
        <button onClick={onUndo} className="btn btn-small" aria-label="Undo">
          Undo
        </button>
        <div
          className="undo-progress"
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    );
  }
);

UndoToast.displayName = 'UndoToast';
