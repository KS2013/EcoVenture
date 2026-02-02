/**
 * EcoVenture Splash Screen
 * Supercell-style loading animation with sound
 */

// Ding sound as base64 (short pleasant notification sound)
const DING_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYZJXqAhAAAAAAD/+9DEAAAIAAaX9AAAJJAw1v81gAQAAANIAAAAQAAAwAADSAAAEVVV+qqqqqqqv0f/6qqqqqqq/V/0dVVVVVVVVVX6P/9VVVVVVVX6v+jqqqqqqqqv0f/6qqqqqqq/V/0dVVVVVVVVVVVVVVRERERERERERBVVVVVVVVVVRERERERERERBVVVVVVVVVVRERERERERERBVVVVVVVVVVRERERERERERBVVVVVVVVVV';

// Loading stages with messages
const LOADING_STAGES = [
  { progress: 10, text: 'Initializing...' },
  { progress: 25, text: 'Loading resources...' },
  { progress: 40, text: 'Preparing AI models...' },
  { progress: 55, text: 'Setting up camera...' },
  { progress: 70, text: 'Loading achievements...' },
  { progress: 85, text: 'Almost ready...' },
  { progress: 95, text: 'Finishing up...' },
  { progress: 100, text: 'Ready!' }
];

class SplashScreen {
  constructor() {
    this.splashElement = document.getElementById('splashScreen');
    this.loadingBar = document.getElementById('loadingBar');
    this.loadingText = document.getElementById('loadingText');
    this.currentProgress = 0;
    this.stageIndex = 0;
    this.isComplete = false;
    this.audioContext = null;
  }

  // Initialize the splash screen
  init() {
    this.animateLoading();
  }

  // Animate the loading progress
  animateLoading() {
    const animate = () => {
      if (this.isComplete) return;

      const stage = LOADING_STAGES[this.stageIndex];

      if (this.currentProgress < stage.progress) {
        // Smooth increment
        this.currentProgress += 0.5;
        this.updateProgress(this.currentProgress, stage.text);
        requestAnimationFrame(animate);
      } else if (this.stageIndex < LOADING_STAGES.length - 1) {
        // Move to next stage
        this.stageIndex++;
        setTimeout(() => requestAnimationFrame(animate), 200);
      } else {
        // Loading complete
        this.complete();
      }
    };

    // Start animation after a brief delay
    setTimeout(() => requestAnimationFrame(animate), 500);
  }

  // Update the progress bar and text
  updateProgress(percent, text) {
    if (this.loadingBar) {
      this.loadingBar.style.width = `${percent}%`;
    }
    if (this.loadingText && text) {
      this.loadingText.textContent = text;
    }
  }

  // Play the ding sound
  async playDingSound() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create a simple ding using oscillators (more reliable than base64)
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Ding sound settings - pleasant bell-like tone
      oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5 note
      oscillator.type = 'sine';

      // Volume envelope - quick attack, medium decay
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.8);

      // Add a second harmonic for richness
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode2 = this.audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(this.audioContext.destination);

      oscillator2.frequency.setValueAtTime(1318.5, this.audioContext.currentTime); // E6 (fifth above)
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.01);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

      oscillator2.start(this.audioContext.currentTime);
      oscillator2.stop(this.audioContext.currentTime + 0.6);

    } catch (error) {
      console.log('Could not play ding sound:', error.message);
    }
  }

  // Complete the loading and show the app
  complete() {
    this.isComplete = true;
    this.updateProgress(100, 'Ready!');

    // Add loaded class for animation
    if (this.splashElement) {
      this.splashElement.classList.add('loaded');
    }

    // Play ding sound
    this.playDingSound();

    // Fade out after a short delay
    setTimeout(() => {
      if (this.splashElement) {
        this.splashElement.classList.add('fade-out');

        // Remove from DOM after transition
        setTimeout(() => {
          if (this.splashElement) {
            this.splashElement.classList.add('hidden');
          }
        }, 500);
      }
    }, 800);
  }

  // Force complete (for when actual resources are loaded)
  forceComplete() {
    this.stageIndex = LOADING_STAGES.length - 1;
    this.currentProgress = 95;
    this.animateLoading();
  }
}

// Initialize splash screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const splash = new SplashScreen();
  splash.init();

  // Expose to window for external control
  window.EcoVentureSplash = splash;
});

// Also handle window load event
window.addEventListener('load', () => {
  // If splash is still showing after everything loads, complete it
  setTimeout(() => {
    if (window.EcoVentureSplash && !window.EcoVentureSplash.isComplete) {
      window.EcoVentureSplash.forceComplete();
    }
  }, 500);
});
