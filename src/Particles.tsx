import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { b, Bed, C, E, Flash, Grain, HEAD, rand, Sfx, tw, useV } from "./kit";

/**
 * 04 Generative particles: 6000 points on a canvas. A spiral galaxy swirls, gets sucked into the
 * centre on a riser, explodes into type on the hit, shimmers, then falls out of frame.
 * Every position is a pure function of the frame (no simulation state), so any frame renders alone.
 */
export const PT_LEN = 250;
const N = 9000;
const HIT = b(8);
const FALL = b(16);

const COLORS = ["255,200,0", "255,200,0", "255,214,90", "255,246,220", "255,120,40", "214,40,20"];

export const Particles: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { w, h, v } = useV();
  const ref = useRef<HTMLCanvasElement>(null);
  const [pts, setPts] = useState<Float32Array | null>(null);
  const [handle] = useState(() => delayRender("sample type for particles"));

  useEffect(() => {
    const fs = v ? w * 0.42 : h * 0.4;
    document.fonts.load(`900 ${fs}px "${HEAD}"`).then(() => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const g = c.getContext("2d")!;
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `900 ${fs}px "${HEAD}"`;
      if (v) { g.fillText("PURE", w / 2, h / 2 - fs * 0.48); g.fillText("CODE", w / 2, h / 2 + fs * 0.48); }
      else g.fillText("PURE CODE", w / 2, h / 2);
      const data = g.getImageData(0, 0, w, h).data;
      const all: number[] = [];
      for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) if (data[(y * w + x) * 4 + 3] > 128) all.push(x, y);
      const out = new Float32Array(N * 2);
      const m = all.length / 2;
      for (let i = 0; i < N; i++) { const k = Math.floor(rand(i * 7.3 + 1) * m); out[i * 2] = all[k * 2]; out[i * 2 + 1] = all[k * 2 + 1]; }
      setPts(out);
      continueRender(handle);
    });
  }, [w, h, v, handle]);

  const pos = (i: number, t: number): [number, number, number] => {
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * (v ? 0.62 : 0.55);
    const r0 = Math.pow(rand(i), 0.55) * R;
    const arm = Math.floor(rand(i + 0.5) * 3);
    const th0 = arm * ((Math.PI * 2) / 3) + (r0 / R) * 4.2 + (rand(i + 2) - 0.5) * 0.7;
    const om = 0.06 / (0.25 + r0 / R);
    const grow = 0.55 + 0.45 * tw(t, 0, 40, E.out);
    const suck = 1 - tw(t, b(5), HIT, E.in);
    const r = r0 * grow * suck;
    const th = th0 + om * t * (1 + 3 * tw(t, b(5), HIT, E.in));
    let x = cx + Math.cos(th) * r * (v ? 1 : 1.5);
    let y = cy + Math.sin(th) * r * (v ? 0.8 : 0.5);
    let a = (0.2 + 0.5 * tw(t, 0, 30)) * (1 - 0.5 * tw(t, b(5), HIT));
    if (t >= HIT && pts) {
      const d = rand(i + 4) * 8;
      const k = tw(t, HIT + d, HIT + d + 26, E.out);
      const tx = pts[i * 2], ty = pts[i * 2 + 1];
      const ang = rand(i + 8) * Math.PI * 2;
      const bulge = Math.sin(Math.PI * k) * (120 + rand(i + 9) * 380);
      x = cx + (tx - cx) * k + Math.cos(ang) * bulge;
      y = cy + (ty - cy) * k + Math.sin(ang) * bulge;
      x += Math.sin(t * 0.15 + i) * 1.4 * k;
      y += Math.cos(t * 0.13 + i * 1.7) * 1.4 * k;
      a = 0.7 + 0.3 * Math.sin(t * 0.3 + i * 2.1) ** 2;
      if (t >= FALL) {
        const delay = (tx / w) * 22 + rand(i + 11) * 8;
        const tt = Math.max(0, t - FALL - delay);
        y += 0.9 * tt * tt;
        x += (rand(i + 12) - 0.5) * tt * 3;
        a *= 1 - Math.min(1, tt / 30);
      }
    }
    return [x, y, a];
  };

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    g.globalCompositeOperation = "source-over";
    g.fillStyle = C.ink;
    g.fillRect(0, 0, w, h);
    const glow = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.5);
    glow.addColorStop(0, `rgba(255,170,0,${f < HIT ? 0.12 + 0.2 * tw(f, b(5), HIT) : 0.1})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = glow; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "lighter";
    g.lineCap = "round";
    const lw = (f >= HIT ? 3 : 2.2) * (Math.min(w, h) / 1080);
    for (let i = 0; i < N; i++) {
      const [x, y, a] = pos(i, f);
      const [px, py] = pos(i, f - 1.5);
      if (a <= 0.01) continue;
      g.strokeStyle = `rgba(${COLORS[i % COLORS.length]},${a * 0.85})`;
      g.lineWidth = lw * (0.6 + rand(i + 20));
      g.beginPath(); g.moveTo(px, py); g.lineTo(x + 0.01, y); g.stroke();
    }
    // bloom: the frame blurred back onto itself
    g.filter = "blur(10px)"; g.globalAlpha = 0.55; g.drawImage(c, 0, 0); g.filter = "none"; g.globalAlpha = 1;
  });

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />
      <Flash at={HIT} color="#FFE7A0" len={7} />
      <Grain opacity={0.06} />
      {bed && <Bed bars={36} />}
      <Sfx at={0} src="fx_wind.wav" volume={0.35} />
      <Sfx at={HIT - 48} src="riser.wav" volume={0.45} />
      <Sfx at={HIT} src="thud.wav" volume={0.85} />
      <Sfx at={HIT} src="fx_magic.wav" volume={0.3} />
      <Sfx at={b(10)} src="fx_chimes.wav" volume={0.2} />
      <Sfx at={FALL - 4} src="whoosh.wav" volume={0.45} />
    </AbsoluteFill>
  );
};
