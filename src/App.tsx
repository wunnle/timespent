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
    </div>
  );
}

export default App;
