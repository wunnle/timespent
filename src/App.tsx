import { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  stopwatchReducer,
  generateId,
} from './store/stopwatches';
import { loadStore, saveStore, createDebouncedSave } from './persistence/storage';
import { useTicker } from './hooks/useTicker';
import { Toolbar } from './components/Toolbar';
import { StopwatchList } from './components/StopwatchList';
import { UndoToast } from './components/UndoToast';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(
    stopwatchReducer,
    undefined,
    loadStore
  );

  const now = useTicker();
  const debouncedSaveRef = useRef(
    createDebouncedSave(saveStore, 300)
  );

  // Auto-save on state changes
  useEffect(() => {
    debouncedSaveRef.current(state);
  }, [state]);

  // Flush save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStore(state);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () =>
      window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  const handleAdd = useCallback(() => {
    dispatch({
      type: 'ADD',
      id: generateId(),
      now: Date.now(),
    });
  }, []);

  const handleStart = useCallback((id: string) => {
    dispatch({
      type: 'START',
      id,
      now: Date.now(),
    });
  }, []);

  const handleStop = useCallback((id: string) => {
    dispatch({
      type: 'STOP',
      id,
      now: Date.now(),
    });
  }, []);

  const handleReset = useCallback((id: string) => {
    dispatch({
      type: 'RESET',
      id,
    });
  }, []);

  const handleRename = useCallback((id: string, name: string) => {
    dispatch({
      type: 'RENAME',
      id,
      name,
    });
  }, []);

  const handleRecolor = useCallback((id: string, color: string) => {
    dispatch({
      type: 'RECOLOR',
      id,
      color,
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    dispatch({
      type: 'DELETE',
      id,
      now: Date.now(),
    });
  }, []);

  const handleUndo = useCallback(() => {
    dispatch({
      type: 'UNDO_DELETE',
      now: Date.now(),
    });
  }, []);

  const undoMessage =
    state.lastDeleted && state.lastDeleted.expiresAt > now
      ? `"${state.lastDeleted.sw.name}" deleted`
      : null;

  return (
    <div className="app">
      <Toolbar onAdd={handleAdd} />
      <StopwatchList
        stopwatches={state.stopwatches}
        now={now}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        onDelete={handleDelete}
        onRename={handleRename}
        onRecolor={handleRecolor}
      />
      <UndoToast message={undoMessage} onUndo={handleUndo} />
      <footer className="footer">
        <div className="footer-content">
          {/* Logo */}
          <div className="footer-divider">
            <div className="footer-line"></div>
            <div className="footer-logo">
              <svg width="32" height="14" viewBox="0 0 48 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="footer-svg">
                <path d="M24 12L32 11.7L24 0.4V12Z" fill="#0D79BE" />
                <path d="M24 12L16 11.7L24 0.4V12Z" fill="#3790BB" />
                <path d="M24 12L0.7 0L7 21L18 17L24 12Z" fill="#F69226" />
                <path d="M24 12L47.3 0L41 21L30 17L24 12Z" fill="#D06A29" />
                <path d="M24 12L41 21H7L24 12Z" fill="#ED7723" />
              </svg>
            </div>
            <div className="footer-line"></div>
          </div>
          <div className="footer-links">
            <div className="footer-made-by">
              <span>made with ♥ by wunnle</span>
            </div>
            <span className="footer-separator"></span>
            <div className="footer-nav">
              <a
                href="https://github.com/wunnle/timespent"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link-item"
              >
                view on GitHub
              </a>
              <span className="footer-dot">•</span>
              <a
                href="https://kafagoz.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link-item"
              >
                kafagoz.com
              </a>
              <span className="footer-dot">•</span>
              <a
                href="https://wunnle.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link-item"
              >
                wunnle.dev
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
