import type { StopwatchState } from '../store/stopwatches';
import { initialState } from '../store/stopwatches';

const STORAGE_KEY = 'stopwatches:v2';
const CURRENT_VERSION = 2;

interface StoragePayload {
  version: number;
  stopwatches: StopwatchState['stopwatches'];
  lastDeleted?: StopwatchState['lastDeleted'];
}

export function loadStore(): StopwatchState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();

    const payload: StoragePayload = JSON.parse(raw);

    // Version migration logic (if needed in future)
    if (payload.version < CURRENT_VERSION) {
      // Migrate old versions here
    }

    const state: StopwatchState = {
      stopwatches: payload.stopwatches || [],
      lastDeleted:
        payload.lastDeleted && payload.lastDeleted.expiresAt > Date.now()
          ? payload.lastDeleted
          : null,
    };

    return state;
  } catch (error) {
    console.error('Failed to load store from localStorage:', error);
    return initialState();
  }
}

export function saveStore(state: StopwatchState): void {
  try {
    const now = Date.now();
    
    // Freeze running stopwatches at their current elapsed time
    const frozenStopwatches = state.stopwatches.map((sw) => {
      if (sw.isRunning && sw.startedAt) {
        const currentElapsed = sw.accumulatedMs + (now - sw.startedAt);
        return {
          ...sw,
          accumulatedMs: currentElapsed,
          isRunning: false,
          startedAt: null,
        };
      }
      return sw;
    });
    
    const payload: StoragePayload = {
      version: CURRENT_VERSION,
      stopwatches: frozenStopwatches,
      lastDeleted: state.lastDeleted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save store to localStorage:', error);
  }
}

export function createDebouncedSave(
  saveFunc: (state: StopwatchState) => void,
  delayMs: number = 300
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (state: StopwatchState) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      saveFunc(state);
      timeoutId = null;
    }, delayMs);
  };
}
