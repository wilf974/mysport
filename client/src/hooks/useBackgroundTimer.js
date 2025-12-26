/**
 * useBackgroundTimer Hook
 *
 * Manages a timer that continues running even when:
 * - The app loses focus
 * - The device screen is locked
 * - The browser tab is minimized
 *
 * Uses a Web Worker to maintain time in the background
 * and handles synchronization when the app regains focus.
 *
 * Usage:
 *   const { time, start, pause, resume, stop } = useBackgroundTimer();
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export function useBackgroundTimer() {
  const [time, _setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const workerRef = useRef(null);

  // Initialize Web Worker on mount
  useEffect(() => {
    // Create worker from blob to avoid issues with paths
    const workerCode = `
let startTime = null;
let isRunning = false;
let pausedDuration = 0;
let pauseStartTime = null;

self.onmessage = function(event) {
  const { command, timestamp } = event.data;

  switch (command) {
    case 'start':
      if (!isRunning) {
        startTime = timestamp - pausedDuration;
        isRunning = true;
        pauseStartTime = null;
        self.postMessage({ type: 'started' });
        updateTimer();
      }
      break;

    case 'pause':
      if (isRunning) {
        isRunning = false;
        pauseStartTime = timestamp;
        self.postMessage({ type: 'paused' });
      }
      break;

    case 'resume':
      if (!isRunning && pauseStartTime) {
        pausedDuration += (timestamp - pauseStartTime);
        pauseStartTime = null;
        isRunning = true;
        self.postMessage({ type: 'resumed' });
        updateTimer();
      }
      break;

    case 'stop':
      isRunning = false;
      startTime = null;
      pausedDuration = 0;
      pauseStartTime = null;
      self.postMessage({ type: 'stopped' });
      break;

    case 'sync':
      if (isRunning) {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        self.postMessage({ type: 'sync', elapsed });
      }
      break;

    case 'reset':
      isRunning = false;
      startTime = null;
      pausedDuration = 0;
      pauseStartTime = null;
      self.postMessage({ type: 'reset', elapsed: 0 });
      break;
  }
};

function updateTimer() {
  if (!isRunning) return;

  const currentTime = Date.now();
  const elapsed = Math.floor((currentTime - startTime) / 1000);

  self.postMessage({
    type: 'tick',
    elapsed: elapsed
  });

  setTimeout(updateTimer, 100);
}
`;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    workerRef.current = worker;

    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  // Handle messages from worker
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    const handleMessage = (event) => {
      const { type, elapsed } = event.data;

      switch (type) {
        case 'tick':
          _setTime(elapsed);
          break;

        case 'sync':
          // Synchronize when app regains focus
          _setTime(elapsed);
          break;

        case 'started':
          setIsRunning(true);
          setIsPaused(false);
          break;

        case 'paused':
          setIsPaused(true);
          break;

        case 'resumed':
          setIsPaused(false);
          break;

        case 'stopped':
          setIsRunning(false);
          setIsPaused(false);
          break;

        case 'reset':
          _setTime(0);
          setIsRunning(false);
          setIsPaused(false);
          break;

        default:
          break;
      }
    };

    worker.addEventListener('message', handleMessage);
    return () => worker.removeEventListener('message', handleMessage);
  }, []);

  // Handle visibility changes (when app loses/regains focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!workerRef.current) return;

      if (document.hidden) {
        // App lost focus - worker continues in background
      } else {
        // App regained focus - sync the timer
        if (isRunning && !isPaused) {
          workerRef.current.postMessage({
            command: 'sync',
            timestamp: Date.now()
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused]);

  // Start timer
  const start = useCallback(() => {
    if (workerRef.current && !isRunning) {
      workerRef.current.postMessage({
        command: 'start',
        timestamp: Date.now()
      });
    }
  }, [isRunning]);

  // Pause timer
  const pause = useCallback(() => {
    if (workerRef.current && isRunning && !isPaused) {
      workerRef.current.postMessage({
        command: 'pause',
        timestamp: Date.now()
      });
    }
  }, [isRunning, isPaused]);

  // Resume timer
  const resume = useCallback(() => {
    if (workerRef.current && isPaused) {
      workerRef.current.postMessage({
        command: 'resume',
        timestamp: Date.now()
      });
    }
  }, [isPaused]);

  // Stop timer
  const stop = useCallback(() => {
    if (workerRef.current && isRunning) {
      workerRef.current.postMessage({
        command: 'stop',
        timestamp: Date.now()
      });
    }
  }, [isRunning]);

  // Reset timer
  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        command: 'reset',
        timestamp: Date.now()
      });
    }
  }, []);

  // Set timer to a specific value
  const setTime = useCallback((value) => {
    _setTime(value);
  }, []);

  return {
    time,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    setTime
  };
}
