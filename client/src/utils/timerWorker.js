/**
 * Web Worker for background timer
 *
 * This worker maintains a timer that continues running even when:
 * - The browser tab loses focus
 * - The device screen is locked
 * - The app is minimized
 *
 * It communicates with the main thread via postMessage
 */

let startTime = null;
let isRunning = false;
let pausedDuration = 0;
let pauseStartTime = null;

self.onmessage = function(event) {
  const { command, timestamp } = event.data;

  switch (command) {
    case 'start':
      // Start or resume the timer
      if (!isRunning) {
        startTime = timestamp - pausedDuration;
        isRunning = true;
        pauseStartTime = null;

        // Send immediate acknowledgement
        self.postMessage({ type: 'started' });

        // Start sending tick updates
        updateTimer();
      }
      break;

    case 'pause':
      // Pause the timer
      if (isRunning) {
        isRunning = false;
        pauseStartTime = timestamp;
        self.postMessage({ type: 'paused' });
      }
      break;

    case 'resume':
      // Resume from pause
      if (!isRunning && pauseStartTime) {
        pausedDuration += (timestamp - pauseStartTime);
        pauseStartTime = null;
        isRunning = true;
        self.postMessage({ type: 'resumed' });
        updateTimer();
      }
      break;

    case 'stop':
      // Stop the timer
      isRunning = false;
      startTime = null;
      pausedDuration = 0;
      pauseStartTime = null;
      self.postMessage({ type: 'stopped' });
      break;

    case 'sync':
      // Synchronize timer state (called when app regains focus)
      if (isRunning) {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        self.postMessage({ type: 'sync', elapsed });
      }
      break;

    case 'reset':
      // Reset the timer
      isRunning = false;
      startTime = null;
      pausedDuration = 0;
      pauseStartTime = null;
      self.postMessage({ type: 'reset', elapsed: 0 });
      break;

    default:
      console.warn('Unknown command:', command);
  }
};

/**
 * Update timer every 100ms and send to main thread
 * This provides smooth UI updates without relying on browser frame rate
 */
function updateTimer() {
  if (!isRunning) return;

  const currentTime = Date.now();
  const elapsed = Math.floor((currentTime - startTime) / 1000);

  self.postMessage({
    type: 'tick',
    elapsed: elapsed
  });

  // Continue updating every 100ms
  setTimeout(updateTimer, 100);
}
