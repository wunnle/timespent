import { getNextAvailableColor } from '../utils/colors';

export interface Stopwatch {
  id: string;
  name: string;
  color: string;
  accumulatedMs: number;
  startedAt: number | null;
  isRunning: boolean;
  createdAt: number;
}

export interface StopwatchState {
  stopwatches: Stopwatch[];
  lastDeleted: { sw: Stopwatch; expiresAt: number } | null;
}

export type StopwatchAction =
  | { type: 'ADD'; id: string; now: number }
  | { type: 'DELETE'; id: string; now: number }
  | { type: 'UNDO_DELETE'; now: number }
  | { type: 'START'; id: string; now: number }
  | { type: 'STOP'; id: string; now: number }
  | { type: 'RESET'; id: string }
  | { type: 'RENAME'; id: string; name: string }
  | { type: 'RECOLOR'; id: string; color: string }
  | { type: 'LOAD'; state: StopwatchState };

export function generateId(): string {
  return `sw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function initialState(): StopwatchState {
  return {
    stopwatches: [],
    lastDeleted: null,
  };
}

export function stopwatchReducer(
  state: StopwatchState,
  action: StopwatchAction
): StopwatchState {
  switch (action.type) {
    case 'ADD': {
      const usedColors = state.stopwatches.map((sw) => sw.color);
      const nextColor = getNextAvailableColor(usedColors);

      const newStopwatch: Stopwatch = {
        id: action.id,
        name: `Stopwatch ${state.stopwatches.length + 1}`,
        color: nextColor,
        accumulatedMs: 0,
        startedAt: null,
        isRunning: false,
        createdAt: action.now,
      };
      return {
        ...state,
        stopwatches: [...state.stopwatches, newStopwatch],
      };
    }

    case 'DELETE': {
      const sw = state.stopwatches.find((s) => s.id === action.id);
      if (!sw) return state;
      return {
        stopwatches: state.stopwatches.filter((s) => s.id !== action.id),
        lastDeleted: {
          sw,
          expiresAt: action.now + 5000, // 5 second undo window
        },
      };
    }

    case 'UNDO_DELETE': {
      if (!state.lastDeleted) return state;
      if (action.now > state.lastDeleted.expiresAt) {
        return { ...state, lastDeleted: null };
      }
      return {
        stopwatches: [...state.stopwatches, state.lastDeleted.sw],
        lastDeleted: null,
      };
    }

    case 'START': {
      return {
        ...state,
        stopwatches: state.stopwatches.map((sw) =>
          sw.id === action.id
            ? { ...sw, isRunning: true, startedAt: action.now }
            : sw
        ),
      };
    }

    case 'STOP': {
      return {
        ...state,
        stopwatches: state.stopwatches.map((sw) => {
          if (sw.id === action.id && sw.isRunning && sw.startedAt !== null) {
            const newAccumulated =
              sw.accumulatedMs + (action.now - sw.startedAt);
            return {
              ...sw,
              isRunning: false,
              startedAt: null,
              accumulatedMs: newAccumulated,
            };
          }
          return sw;
        }),
      };
    }

    case 'RESET': {
      return {
        ...state,
        stopwatches: state.stopwatches.map((sw) =>
          sw.id === action.id
            ? {
                ...sw,
                accumulatedMs: 0,
                isRunning: false,
                startedAt: null,
              }
            : sw
        ),
      };
    }

    case 'RENAME': {
      return {
        ...state,
        stopwatches: state.stopwatches.map((sw) =>
          sw.id === action.id ? { ...sw, name: action.name } : sw
        ),
      };
    }

    case 'RECOLOR': {
      return {
        ...state,
        stopwatches: state.stopwatches.map((sw) =>
          sw.id === action.id ? { ...sw, color: action.color } : sw
        ),
      };
    }

    case 'LOAD': {
      return action.state;
    }

    default:
      return state;
  }
}

export function getElapsedMs(sw: Stopwatch, now: number): number {
  if (sw.isRunning && sw.startedAt !== null) {
    return sw.accumulatedMs + (now - sw.startedAt);
  }
  return sw.accumulatedMs;
}
