import { useState, useEffect } from 'react';

/**
 * Shared timer hook that provides a single adaptive timer for all components.
 * This prevents creating multiple timers (one per component) which improves battery efficiency.
 *
 * The timer adapts its update frequency based on the nearest scheduled reminder:
 * - Updates every 5 seconds when any reminder is ≤ 60 seconds away
 * - Updates every 60 seconds when all reminders are > 60 seconds away
 *
 * The timer respects page visibility. When the page is hidden, updates stop.
 * When visible again, an immediate update is triggered.
 */

// Global state - shared across all hook instances
let currentTimestamp = Date.now();
const listeners = new Set<() => void>();

// Track nextRunAt times for all subscribed components
// Key: unique component ID, Value: nextRunAt timestamp
const nextRunAtTimes = new Map<symbol, number>();

// Single global timeout (dynamic interval)
let globalTimeout: number | null = null;

// Calculate the appropriate interval based on the nearest reminder
const getAdaptiveInterval = (): number => {
  if (nextRunAtTimes.size === 0) {
    return 60000; // Default to 60 seconds if no times registered
  }

  const now = Date.now();
  const soonestTime = Math.min(...nextRunAtTimes.values());
  const timeUntilSoonest = soonestTime - now;

  // If any reminder is within 60 seconds, use 5-second updates
  if (timeUntilSoonest <= 60000) {
    return 5000;
  }

  // Otherwise use 60-second updates for battery efficiency
  return 60000;
};

// Notify all listeners that time has updated
const notifyListeners = () => {
  currentTimestamp = Date.now();
  listeners.forEach(listener => listener());
};

// Start or restart the timer with appropriate interval
const scheduleNextUpdate = () => {
  if (globalTimeout) {
    clearTimeout(globalTimeout);
  }

  const interval = getAdaptiveInterval();

  globalTimeout = setTimeout(() => {
    // Only update if page is visible
    if (!document.hidden) {
      notifyListeners();
    }

    // Schedule the next update
    scheduleNextUpdate();
  }, interval) as unknown as number;
};

const startGlobalTimer = () => {
  if (globalTimeout) return; // Already running
  scheduleNextUpdate();
};

const stopGlobalTimer = () => {
  if (globalTimeout) {
    clearTimeout(globalTimeout);
    globalTimeout = null;
  }
};

// Handle page visibility changes
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // Page became visible - update immediately
    notifyListeners();

    // Restart timer with potentially new interval
    scheduleNextUpdate();
  }
};

// Initialize visibility listener (only once)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Hook that subscribes to the shared adaptive timer.
 *
 * @param nextRunAt - Optional ISO 8601 timestamp string of when the next reminder runs.
 *                    Used to calculate adaptive update intervals.
 * @returns Current timestamp which updates adaptively (every 5s or 60s)
 */
export const useSharedTimer = (nextRunAt?: string): number => {
  const [, forceUpdate] = useState({});
  const [componentId] = useState(() => Symbol('timer-component'));

  useEffect(() => {
    // Subscribe this component to timer updates
    const listener = () => forceUpdate({});
    listeners.add(listener);

    // Register this component's nextRunAt time if provided
    if (nextRunAt) {
      const timestamp = new Date(nextRunAt).getTime();
      if (!isNaN(timestamp)) {
        nextRunAtTimes.set(componentId, timestamp);
      }
    }

    // Start or restart global timer
    const wasRunning = globalTimeout !== null;
    if (listeners.size === 1) {
      startGlobalTimer();
    } else if (wasRunning && nextRunAt) {
      // If timer was already running and we added a new nextRunAt,
      // restart it to potentially use a faster interval
      scheduleNextUpdate();
    }

    return () => {
      // Unsubscribe this component
      listeners.delete(listener);
      nextRunAtTimes.delete(componentId);

      // Stop global timer if no more subscribers
      if (listeners.size === 0) {
        stopGlobalTimer();
      } else if (nextRunAtTimes.size > 0) {
        // Restart timer with potentially slower interval now that this component is gone
        scheduleNextUpdate();
      }
    };
  }, [componentId, nextRunAt]);

  return currentTimestamp;
};
