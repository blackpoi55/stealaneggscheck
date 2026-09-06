/**
 * Alert tones, generated rather than loaded so there is no audio file to ship.
 *
 * The context is created on the first call, which must come from a click —
 * mobile browsers refuse to start audio without a user gesture. Turning the
 * alert on plays a preview, which doubles as that gesture.
 */

let audio: AudioContext | null = null;

function ensureAudio() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audio = new Ctor();
  }
  void audio.resume();
  return audio;
}

function play(notes: number[], gap = 0.16) {
  const ctx = ensureAudio();
  if (!ctx) return;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const at = ctx.currentTime + i * gap;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.55);
  });
}

/** heads-up: a rising figure */
export const chimeWarn = () => play([880, 1108.73, 1318.51]);

/** it is happening now: a shorter, falling one */
export const chimeNow = () => play([1318.51, 1046.5], 0.14);
