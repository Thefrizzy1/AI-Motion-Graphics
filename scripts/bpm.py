"""Measure a song's tempo and where its first beat is, so the motion can land on the beat.
    python scripts/bpm.py public/music/bed.mp3            (needs ffmpeg + numpy)
Prints the BPM and the first beat in seconds and in frames at 30 fps -> put that into MUSIC_FIRST_BEAT in src/kit.tsx.
How: spectral flux (how much the sound changes) gives an onset curve; a grid of beats is slid over it and the
tempo + offset where the most onsets land on the grid wins. Works well for music with a steady beat."""
import subprocess, sys
import numpy as np

f = sys.argv[1]
t0, t1 = 0.0, 60.0          # analyse the first minute
sr, hop, n = 11025, 128, 1024
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
S = np.log1p(10 * np.abs(np.fft.rfft(frames, axis=1)))
flux = np.maximum(0, np.diff(S, axis=0)).sum(1)
fr = sr / hop
seg = flux[int(t0 * fr):int(t1 * fr)]
best = (0, 0, 0)
for bpm in np.arange(70, 180, 0.05):
    p = 60 / bpm * fr
    for ph in np.arange(0, p, 1):
        idx = (ph + np.arange(0, len(seg) / p - 1) * p).astype(int)
        sc = seg[idx].mean()
        if sc > best[0]:
            best = (sc, bpm, ph / fr)
_, bpm, first = best
print(f"{bpm:.2f} BPM, first beat at {first:.3f} s = frame {round(first * 30)} at 30 fps")
print(f"at 30 fps: one beat = {30 * 60 / bpm:.2f} frames, one bar (4 beats) = {4 * 30 * 60 / bpm:.2f} frames")
