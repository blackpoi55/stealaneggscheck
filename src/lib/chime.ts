/**
 * Alert tones, generated rather than loaded so there is no audio file to ship.
 *
 * The context is created on the first call, which must come from a click —
 * mobile browsers refuse to start audio without a user gesture. Turning the
 * alert on plays a single preview, which doubles as that gesture.
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

const TAIL = 0.5; // how long a note rings out
const REST = 0.32; // silence between repeats, so they read as separate alerts

function play(notes: number[], gap: number, repeats: number) {
  const ctx = ensureAudio();
  if (!ctx) return;

  const pattern = (notes.length - 1) * gap + TAIL;
  const start = ctx.currentTime;

  for (let round = 0; round < repeats; round++) {
    const roundAt = start + round * (pattern + REST);
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const at = roundAt + i * gap;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.26, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + TAIL);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + TAIL + 0.05);
    });
  }
}

/** heads-up before an event, sounded three times over */
export const chimeWarn = (repeats = 3) => play([880, 1108.73, 1318.51], 0.16, repeats);
