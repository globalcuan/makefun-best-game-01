// Generate every sound locally with Web Audio; no samples or network assets are used.
export function createAudio() {
  let context = null;
  let master = null;
  let muted = false;
  let bassOscillator = null;
  let bassGain = null;
  let bassFilter = null;
  let bassTimer = null;

  function ensureContext() {
    if (context) {
      if (context.state === 'suspended') {
        context.resume();
      }
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = muted ? 0 : 0.32;
    master.connect(context.destination);
  }

  function tone(frequency, duration, waveform = 'sine', volume = 0.2, endFrequency = frequency) {
    ensureContext();
    if (!context || muted) {
      return;
    }
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  function startBass(waveNumber = 1) {
    ensureContext();
    if (!context || bassOscillator) {
      return;
    }
    bassOscillator = context.createOscillator();
    bassGain = context.createGain();
    bassFilter = context.createBiquadFilter();
    bassOscillator.type = 'triangle';
    bassOscillator.frequency.value = 48;
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 125;
    bassGain.gain.value = muted ? 0 : 0.045;
    bassOscillator.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(master);
    bassOscillator.start();
    setBassWave(waveNumber);
    bassTimer = window.setInterval(() => {
      if (!context || muted) {
        return;
      }
      const pulse = context.currentTime;
      bassGain.gain.cancelScheduledValues(pulse);
      bassGain.gain.setValueAtTime(0.02, pulse);
      bassGain.gain.linearRampToValueAtTime(0.06, pulse + 0.08);
      bassGain.gain.linearRampToValueAtTime(0.02, pulse + 0.42);
    }, Math.max(380, 730 - waveNumber * 12));
  }

  function setBassWave(waveNumber) {
    if (!context || !bassOscillator) {
      return;
    }
    const tempo = Math.max(380, 730 - waveNumber * 12);
    if (bassTimer) {
      window.clearInterval(bassTimer);
    }
    bassTimer = window.setInterval(() => {
      if (!muted) {
        const pulse = context.currentTime;
        bassGain.gain.cancelScheduledValues(pulse);
        bassGain.gain.setValueAtTime(0.02, pulse);
        bassGain.gain.linearRampToValueAtTime(0.06, pulse + 0.08);
        bassGain.gain.linearRampToValueAtTime(0.02, pulse + 0.42);
      }
    }, tempo);
  }

  function stopBass() {
    if (bassTimer) {
      window.clearInterval(bassTimer);
      bassTimer = null;
    }
    if (bassOscillator) {
      bassOscillator.stop();
      bassOscillator.disconnect();
      bassOscillator = null;
    }
  }

  return {
    unlock() {
      ensureContext();
    },
    toggleMute() {
      muted = !muted;
      if (master) {
        master.gain.setTargetAtTime(muted ? 0 : 0.32, context.currentTime, 0.03);
      }
      return muted;
    },
    isMuted() {
      return muted;
    },
    startBass,
    setBassWave,
    stopBass,
    shoot() { tone(780, 0.075, 'square', 0.09, 340); },
    hit() { tone(190, 0.1, 'triangle', 0.12, 95); },
    explosion() { tone(125, 0.34, 'sawtooth', 0.22, 32); },
    pickup() { tone(560, 0.09, 'sine', 0.11, 920); },
    levelUp() { tone(420, 0.42, 'triangle', 0.17, 1120); },
    hurt() { tone(155, 0.3, 'sawtooth', 0.18, 42); },
    dash() { tone(320, 0.18, 'sawtooth', 0.1, 1180); },
    bossWarning() { tone(92, 0.8, 'sawtooth', 0.22, 38); },
  };
}
