// Synthesized Web Audio API sound effects for zero-latency, cross-platform audio & tactile feedback

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public hapticsEnabled: boolean = true;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Trigger optional mobile device haptic feedback vibration
  private triggerHaptic(pattern: number | number[]) {
    if (!this.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }

  /**
   * Subtle mechanical micro-click for UI buttons, tabs, and navigation
   */
  public playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Soft mechanical pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Audio context might be restricted before initial user gesture
    }
  }

  /**
   * Crisp tactile snap when tapping on an answer option card
   */
  public playOptionSelect() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.03);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);

      this.triggerHaptic(12);
    } catch {
      // ignore
    }
  }

  /**
   * Subtle, pleasing marimba/bell chord chime for correct answers.
   * Scales harmonious pitch up slightly as the combo increases!
   */
  public playCorrect(combo = 0) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Subtle haptic pulse
      this.triggerHaptic([15, 30, 20]);

      // Base chord notes (F major / A / C / F pentatonic)
      // Transpose slightly upwards based on streak combo
      const semitoneShift = Math.min(6, combo);
      const pitchMultiplier = Math.pow(2, semitoneShift / 12);

      const baseNotes = [
        523.25 * pitchMultiplier, // C5
        659.25 * pitchMultiplier, // E5
        783.99 * pitchMultiplier, // G5
        1046.5 * pitchMultiplier, // C6
      ];

      // Play soft arpeggiated marimba chime
      baseNotes.forEach((freq, idx) => {
        if (!ctx) return;
        const noteStart = now + idx * 0.038;
        const noteDuration = 0.22;

        // Fundamental tone (warm sine)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3600, noteStart);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Gentle overtone shimmer (triangle)
        const harmonicOsc = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        harmonicOsc.type = 'triangle';
        harmonicOsc.frequency.setValueAtTime(freq * 2, noteStart);

        // Envelopes: Crisp 4ms attack, smooth exponential decay
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration);

        harmonicGain.gain.setValueAtTime(0.001, noteStart);
        harmonicGain.gain.exponentialRampToValueAtTime(0.03, noteStart + 0.006);
        harmonicGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration * 0.7);

        osc.connect(filter);
        harmonicOsc.connect(filter);
        filter.connect(gain);
        harmonicGain.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        harmonicOsc.start(noteStart);
        osc.stop(noteStart + noteDuration);
        harmonicOsc.stop(noteStart + noteDuration);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Tactile, soft muted bass drop for wrong answers.
   * Gentle acoustic thud rather than a harsh or abrasive buzzer.
   */
  public playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Heavy subtle haptic bump
      this.triggerHaptic([35, 20, 35]);

      // 1. Soft low-frequency thud
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(280, now);

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(160, now);
      bassOsc.frequency.exponentialRampToValueAtTime(65, now + 0.18);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + 0.18);

      // 2. Subtle low-mid wooden damping transient
      const woodOsc = ctx.createOscillator();
      const woodGain = ctx.createGain();
      woodOsc.type = 'triangle';
      woodOsc.frequency.setValueAtTime(120, now);
      woodOsc.frequency.exponentialRampToValueAtTime(50, now + 0.14);

      woodGain.gain.setValueAtTime(0.08, now);
      woodGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      woodOsc.connect(woodGain);
      woodGain.connect(ctx.destination);

      woodOsc.start(now);
      woodOsc.stop(now + 0.14);
    } catch {
      // ignore
    }
  }

  /**
   * Celebratory ascending fanfare with sparkling harmonic bells for level-ups!
   */
  public playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Rich celebratory haptic sequence
      this.triggerHaptic([20, 40, 20, 40, 60]);

      // Uplifting pentatonic arpeggio sequence
      const notes = [
        { freq: 440.0, time: 0.0, dur: 0.28 },    // A4
        { freq: 554.37, time: 0.07, dur: 0.28 },  // C#5
        { freq: 659.25, time: 0.14, dur: 0.3 },   // E5
        { freq: 880.0, time: 0.21, dur: 0.35 },   // A5
        { freq: 1108.73, time: 0.28, dur: 0.4 },  // C#6
        { freq: 1318.51, time: 0.35, dur: 0.55 }, // E6
      ];

      // Sub-bass root tone for cinematic warmth
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(220, now);
      subGain.gain.setValueAtTime(0.12, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.7);

      // Play bell arpeggios
      notes.forEach(({ freq, time, dur }) => {
        if (!ctx) return;
        const noteStart = now + time;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4200, noteStart);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Shimmer overtone (2x harmonic)
        const shimmer = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(freq * 2, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.14, noteStart + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

        shimmerGain.gain.setValueAtTime(0.001, noteStart);
        shimmerGain.gain.exponentialRampToValueAtTime(0.04, noteStart + 0.008);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur * 0.7);

        osc.connect(filter);
        shimmer.connect(filter);
        filter.connect(gain);
        shimmerGain.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        shimmer.start(noteStart);
        osc.stop(noteStart + dur);
        shimmer.stop(noteStart + dur);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Soft timer countdown click
   */
  public playTick(isUrgent = false) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 1100 : 750, now);

      gain.gain.setValueAtTime(isUrgent ? 0.06 : 0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);

      if (isUrgent) {
        this.triggerHaptic(8);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Victory fanfare for battle wins & daily challenge completions
   */
  public playBattleWin() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      this.triggerHaptic([20, 50, 20, 50, 100]);

      const melody = [
        { freq: 523.25, time: 0.0, dur: 0.18 },  // C5
        { freq: 659.25, time: 0.1, dur: 0.18 },  // E5
        { freq: 783.99, time: 0.2, dur: 0.22 },  // G5
        { freq: 1046.5, time: 0.32, dur: 0.45 }, // C6
        { freq: 880.0, time: 0.46, dur: 0.22 },  // A5
        { freq: 1046.5, time: 0.58, dur: 0.6 },  // C6 (Triumph sustain)
      ];

      melody.forEach(({ freq, time, dur }) => {
        if (!ctx) return;
        const noteStart = now + time;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.14, noteStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + dur);
      });
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEffects();

