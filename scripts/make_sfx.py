"""Sound effects for the 3D stingers / intros / outros, synthesised (no samples, no licences): 48 kHz stereo wavs in
public/sfx/. Run with any Python that has numpy:  python scripts/make_sfx.py

  bell.wav      small hand bell, two strikes ("ring the bell")
  ding.wav      one bright strike (a highlight / a number landing)
  click.wav     button press + release (subscribe)
  pop.wav       quick pitched pop (a chip / card appears)
  whoosh.wav    filtered-noise swoosh (camera move / scene change)
  clink.wav     cup / glass clink (buy me a coffee)
  thud.wav      soft low thump (a slab lands on the board)
  riser.wav     short rising swell (intro build)
"""
import os
import wave
import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def save(name, x, pan=0.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    l, r = x * (1 - max(0, pan)), x * (1 + min(0, pan))
    st = (np.stack([l, r], 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
    print(name, f"{len(x) / SR:.2f}s")


def strike(f0, dur, partials=((1, 1, 1.0), (2.0, .5, .6), (2.76, .45, .45), (5.4, .25, .25), (8.93, .12, .14))):
    """inharmonic bell partials (ratio, amp, decay-scale) + a short noisy strike."""
    tt = t(dur)
    x = sum(a * np.sin(2 * np.pi * f0 * r * tt + rng.uniform(0, 6)) * np.exp(-tt / (dur * d * 0.45)) for r, a, d in partials)
    hit = rng.normal(0, 1, len(tt)) * np.exp(-tt / 0.004) * 0.5
    return x + hit


def bandnoise(dur, f_from, f_to, q=4.0):
    """noise through a band-pass whose centre sweeps (simple 2-pole resonator, sample by sample)."""
    n = int(SR * dur); x = rng.normal(0, 1, n); y = np.zeros(n)
    fc = np.geomspace(f_from, f_to, n); y1 = y2 = 0.0
    for i in range(n):
        w = 2 * np.pi * fc[i] / SR; r = 1 - w / (2 * q)
        y0 = x[i] * (1 - r) + 2 * r * np.cos(w) * y1 - r * r * y2
        y[i] = y0; y2, y1 = y1, y0
    return y


os.makedirs(OUT, exist_ok=True)

# bell: two strikes of a small bell
b = np.zeros(int(SR * 2.4))
s1 = strike(1320, 2.0); b[:len(s1)] += s1
s2 = strike(1320, 2.0) * 0.8; b[int(SR * 0.32):int(SR * 0.32) + len(s2)] += s2[:len(b) - int(SR * 0.32)]
save("bell.wav", b)
save("ding.wav", strike(1760, 1.4, ((1, 1, 1.0), (2.0, .35, .5), (3.0, .2, .3), (4.2, .1, .2))))

# click: press + release
c = np.zeros(int(SR * 0.25)); tt = t(0.012)
for at, f, a in ((0.0, 2400, 1.0), (0.085, 3100, 0.7)):
    i = int(SR * at); c[i:i + len(tt)] += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.0025) + a * 0.6 * rng.normal(0, 1, len(tt)) * np.exp(-tt / 0.0015)
save("click.wav", c)

# pop: fast pitch drop
tt = t(0.14); f = 900 * np.exp(-tt / 0.03) + 180
save("pop.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.04))

# whoosh: swept band noise, swell in and out
d = 0.75; w = bandnoise(d, 250, 3200, q=3.0); tt = t(d)
save("whoosh.wav", w * np.sin(np.pi * tt / d) ** 2)

# clink: bright glassy partials, fast decay, tiny second touch
k = strike(2600, 0.9, ((1, 1, .6), (1.47, .7, .45), (2.09, .5, .3), (2.94, .3, .2)))
k2 = strike(2650, 0.6, ((1, 1, .5), (1.5, .6, .3))) * 0.35
kk = np.zeros(int(SR * 1.0)); kk[:len(k)] += k; kk[int(SR * 0.11):int(SR * 0.11) + len(k2)] += k2
save("clink.wav", kk)

# thud: low sine + body noise
tt = t(0.5); f = 95 * np.exp(-tt / 0.08) + 48
save("thud.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.12) + 0.15 * bandnoise(0.5, 400, 150, q=2) * np.exp(-tt / 0.05))

# riser: rising band noise + rising tone, ends on a soft cut
d = 1.6; tt = t(d)
r = bandnoise(d, 200, 5000, q=5.0) * (tt / d) ** 2 + 0.25 * np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * tt / d)) / SR) * (tt / d) ** 3
save("riser.wav", r * np.minimum(1, (d - tt) / 0.05))

# ── effect beds for the H3 bridges (H3's own audio is muted: it talked) ──
def env(n, a, r):  # attack/release envelope over n samples
    e = np.ones(n); ai, ri = int(SR * a), int(SR * r)
    e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri); return e

d = 5.0; tt = t(d); n = len(tt)
rumble = np.sin(2 * np.pi * np.cumsum(38 + 10 * tt / d) / SR) * 0.8 + bandnoise(d, 60, 160, q=2) * 0.6
crackle = (rng.random(n) < 0.004 * (tt / d)) * rng.normal(0, 1, n); crackle = np.convolve(crackle, np.exp(-np.arange(400) / 60), "same")
shimmer = sum(np.sin(2 * np.pi * f * tt * (1 + 0.003 * np.sin(2 * np.pi * 5 * tt))) for f in (880, 1320, 1760)) * 0.08 * (tt / d)
save("fx_magic.wav", (rumble * (0.4 + 0.6 * np.sin(np.pi * tt / d)) + crackle * 0.5 + shimmer) * env(n, 0.4, 1.0))

d = 4.0; tt = t(d); n = len(tt)
roar = bandnoise(d, 300, 900, q=1.2) * 0.9 + bandnoise(d, 80, 200, q=1.5) * 0.7
burst = np.clip((tt - 0.6) / 0.25, 0, 1) * np.exp(-np.maximum(tt - 0.9, 0) / 1.4)
save("fx_fire.wav", roar * burst * env(n, 0.05, 0.8))

d = 5.0; tt = t(d); ch = np.zeros(len(tt))
for k, f in enumerate([1047, 1319, 1568, 2093, 1760, 2349, 2637, 3136]):
    s0 = strike(f, 1.6, ((1, 1, .8), (2.0, .3, .4), (3.0, .15, .3))) * (0.5 + 0.06 * k)
    i = int(SR * (0.25 + k * 0.42)); ch[i:i + len(s0)] += s0[:max(0, len(ch) - i)]
save("fx_chimes.wav", ch * env(len(ch), 0.05, 1.2) + bandnoise(d, 2000, 4000, q=3) * 0.04)

d = 5.0; tt = t(d)
wind = bandnoise(d, 400, 2400, q=2.0) * np.sin(np.pi * tt / d) ** 1.5 + bandnoise(d, 2400, 300, q=2.0) * 0.6 * np.sin(np.pi * tt / d) ** 3
save("fx_wind.wav", wind * env(len(tt), 0.2, 0.6))
