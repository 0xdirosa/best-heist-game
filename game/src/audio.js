// Meridian Midnight: every sound is synthesized with WebAudio, no files.
// A pickup chime, a vault crack, footsteps, a two-tone alarm and a win arpeggio.

/** A sound board that stays silent until the player first interacts. */
export function createAudio() {
  return {
    ctx: null,
    muted: false,
    alarmNodes: null,
    /** Start the audio context from a user gesture; safe to call twice. */
    ensure() {
      if (!this.ctx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
    },
    /** One short tone: frequency, seconds, shape and volume. */
    tone(freq, seconds, type, volume, when = 0) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + when;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + seconds + 0.05);
    },
    pickup() {
      this.tone(880, 0.12, 'sine', 0.16);
      this.tone(1318, 0.18, 'sine', 0.12, 0.07);
    },
    crack() {
      this.tone(220, 0.25, 'triangle', 0.2);
      this.tone(440, 0.3, 'sine', 0.16, 0.1);
      this.tone(660, 0.35, 'sine', 0.14, 0.2);
    },
    step() {
      this.tone(140 + Math.random() * 40, 0.05, 'sine', 0.04);
    },
    busted() {
      this.tone(196, 0.4, 'sawtooth', 0.14);
      this.tone(147, 0.6, 'sawtooth', 0.14, 0.25);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.35, 'sine', 0.15, i * 0.12));
    },
    /** The alarm siren while the meter is high; call every frame, it manages itself. */
    alarm(on) {
      if (!this.ctx || this.muted) {
        this.alarmOff();
        return;
      }
      if (on && !this.alarmNodes) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 620;
        lfo.type = 'sine';
        lfo.frequency.value = 1.6;
        lfoGain.gain.value = 180;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        gain.gain.value = 0.045;
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        lfo.start();
        this.alarmNodes = { osc, gain, lfo };
      } else if (!on && this.alarmNodes) {
        this.alarmOff();
      }
    },
    alarmOff() {
      if (!this.alarmNodes) return;
      try {
        this.alarmNodes.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.alarmNodes.osc.stop(this.ctx.currentTime + 0.3);
        this.alarmNodes.lfo.stop(this.ctx.currentTime + 0.3);
      } catch {
        // Already stopped; nothing to silence.
      }
      this.alarmNodes = null;
    },
    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) this.alarmOff();
      return this.muted;
    },
  };
}
