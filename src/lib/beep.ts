/**
 * Plays a short three-beep alert using the Web Audio API — no audio file
 * to ship or load, works entirely client-side.
 */
export function playCompletionBeep() {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const beepTimes = [0, 0.25, 0.5];

  beepTimes.forEach((offset) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + offset + 0.18,
    );
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime + offset);
    oscillator.stop(ctx.currentTime + offset + 0.2);
  });

  // Close the context once the beeps have finished playing.
  setTimeout(() => {
    ctx.close().catch(() => {});
  }, 900);
}
