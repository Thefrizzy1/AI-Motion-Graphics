import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { b, Bed, C, E, Flash, PIXEL, rand, Sfx, tw, useV } from "./kit";

/**
 * 05 Pixel-art animation: drawn at 1/6 resolution on a canvas and scaled up with hard pixels.
 * Parallax night city, a little runner that jumps for a coin on the beat, LEVEL UP on the drop. 300 f.
 */
export const PX_LEN = 300;
const PX = 12;
const SPEED = 1.3; // low-res px per frame
const JUMPS = [2, 4, 6, 7, 8, 10, 12, 13, 14].map(b);
const LEVEL = b(16);

const RUN = [
  ["..kkkkkk..", ".kyyyyyyk.", ".kykyykyk.", ".kyyyyyyk.", ".kyyrryyk.", "..kyyyyk..", ".kyyyyyyk.", "kkyyyyyykk", "..kyyyyk..", "..kk..kk..", ".kk....kk."],
  ["..kkkkkk..", ".kyyyyyyk.", ".kykyykyk.", ".kyyyyyyk.", ".kyyrryyk.", "..kyyyyk..", ".kyyyyyyk.", ".kyyyyyyk.", "..kyyyyk..", "...kkkk...", "...k..k..."],
];
const PAL: Record<string, string> = { k: C.ink, y: C.yellow, r: C.red, w: "#fff" };

export const PixelArt: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { w, h, v } = useV();
  const W = Math.round(w / PX), H = Math.round(h / PX);
  const ref = useRef<HTMLCanvasElement>(null);
  const GROUND = v ? H - 40 : H - 16;
  const CX = v ? 22 : 34;
  const collected = JUMPS.filter((j) => f >= j).length;

  useLayoutEffect(() => {
    const g = ref.current?.getContext("2d");
    if (!g) return;
    const rect = (x: number, y: number, ww: number, hh: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), ww, hh); };
    // sky bands (hard steps, dithered edges)
    const bands = ["#140c2b", "#1d1240", "#2c1854", "#46206a", "#6e2a74", "#a23a72"];
    const bh = Math.ceil(GROUND / bands.length);
    bands.forEach((c, i) => {
      rect(0, i * bh, W, bh, c);
      if (i < bands.length - 1) for (let x = (i % 2); x < W; x += 2) rect(x, (i + 1) * bh - 1, 1, 1, bands[i + 1]);
    });
    // stars
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(rand(i) * W), y = Math.floor(rand(i + 100) * GROUND * 0.6);
      const tw2 = Math.sin(f * 0.25 + i * 3) > 0.6;
      rect(x, y, 1, 1, tw2 ? "#ffffff" : "#8a78c8");
    }
    // moon
    const mx = W * 0.78, my = GROUND * 0.22;
    for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) if (x * x + y * y <= 81) rect(mx + x, my + y, 1, 1, (x + 3) * (x + 3) + (y - 2) * (y - 2) < 18 ? "#f0d98a" : "#ffeeb0");
    // clouds
    for (let i = 0; i < 4; i++) {
      const cx = ((rand(i + 40) * W * 1.5 - f * 0.25 * (1 + i * 0.2)) % (W * 1.5) + W * 1.5) % (W * 1.5) - 30;
      const cy = 18 + rand(i + 41) * GROUND * 0.35;
      rect(cx, cy, 26, 3, "#5b3f86"); rect(cx + 5, cy - 3, 14, 3, "#5b3f86"); rect(cx + 2, cy + 3, 22, 1, "#4a3172");
    }
    // city layers
    const layer = (seed: number, par: number, minH: number, maxH: number, col: string, win: string | null) => {
      let x0 = -40 - f * SPEED * par;
      let k = 0;
      while (x0 < W + 40) {
        const bw = 7 + Math.floor(rand(seed + k) * 12);
        const bh2 = minH + Math.floor(rand(seed + k + 0.3) * (maxH - minH));
        if (x0 + bw < -2) { x0 += bw + 1 + Math.floor(rand(seed + k + 0.9) * 4); k++; continue; }
        rect(x0, GROUND - bh2, bw, bh2, col);
        if (rand(seed + k + 0.7) > 0.6) rect(x0 + Math.floor(bw / 2) - 1, GROUND - bh2 - 5, 1, 5, col);
        if (win) for (let wy = GROUND - bh2 + 3; wy < GROUND - 4; wy += 4) for (let wx = x0 + 2; wx < x0 + bw - 2; wx += 3) {
          const lx = wx - x0;
          const on = rand(lx * 0.37 + wy * 1.31 + seed + k * 7) > 0.62 && !(rand(lx + wy + k + Math.floor(f / 20)) > 0.985);
          if (on) rect(wx, wy, 1, 2, win);
        }
        x0 += bw + 1 + Math.floor(rand(seed + k + 0.9) * 4);
        k++;
      }
    };
    layer(1, 0.2, GROUND * 0.25, GROUND * 0.6, "#2a1c4a", null);
    layer(2, 0.45, GROUND * 0.18, GROUND * 0.45, "#1e1438", "#ffcf4a");
    layer(3, 0.75, GROUND * 0.08, GROUND * 0.26, "#120c24", "#ff9d3c");
    // ground
    rect(0, GROUND, W, H - GROUND, "#2a1d10");
    rect(0, GROUND, W, 2, C.yellow);
    for (let x = -((f * SPEED) % 8); x < W; x += 8) { rect(x, GROUND + 4, 4, 1, "#4a3418"); rect(x + 3, GROUND + 9, 3, 1, "#3c2a14"); }
    // coins
    JUMPS.forEach((j, i) => {
      const x = CX + 5 + (j - f) * SPEED;
      if (f >= j || x > W + 10) return;
      const y = GROUND - 22 - (i % 3 === 2 ? 3 : 0);
      const ph = Math.abs(Math.cos(f * 0.2 + i));
      const rw = Math.max(0.6, 3.2 * ph);
      for (let yy = -3; yy <= 3; yy++) for (let xx = -4; xx <= 4; xx++) {
        const d = (xx / rw) ** 2 + (yy / 3.3) ** 2;
        if (d <= 1) rect(x + xx, y + yy, 1, 1, d > 0.55 ? "#c98a00" : xx < 0 && yy < 0 ? "#fff3b0" : C.yellow);
      }
    });
    // runner: jump arcs peak on the coin frames
    let jy = 0;
    JUMPS.forEach((j) => { const t = (f - (j - 9)) / 18; if (t > 0 && t < 1) jy = Math.max(jy, 4 * t * (1 - t) * 17); });
    if (f >= LEVEL) { const t = (f - LEVEL) / 26; if (t < 1) jy = Math.max(jy, 4 * t * (1 - t) * 28); }
    const spr = jy > 0 ? RUN[0] : RUN[Math.floor(f / 4) % 2];
    const sy = GROUND - spr.length - jy + (jy === 0 && Math.floor(f / 4) % 2 ? 1 : 0);
    rect(CX + 1, GROUND + 1, 8, 1, "#170f08");
    spr.forEach((row, yy) => row.split("").forEach((ch, xx) => { if (ch !== ".") rect(CX + xx, sy + yy, 1, 1, PAL[ch]); }));
    // sparkles + "+100" at each pickup
    JUMPS.forEach((j) => {
      const t = f - j;
      if (t < 0 || t > 14) return;
      const ox = CX + 5, oy = GROUND - 22;
      for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2; rect(ox + Math.cos(a) * t * 1.2, oy + Math.sin(a) * t * 1.2, 1, 1, t % 4 < 2 ? "#fff" : C.yellow); }
    });
    // level-up confetti
    if (f >= LEVEL) for (let i = 0; i < 50; i++) {
      const t = f - LEVEL;
      const x = rand(i) * W + Math.sin(t * 0.1 + i) * 4, y = -10 + t * (0.7 + rand(i + 3) * 1.1) - rand(i + 5) * 40;
      rect(x, y, 2, 2, [C.yellow, "#ff5e7e", "#5ee0ff", "#fff"][i % 4]);
    }
  });

  const lv = tw(f, LEVEL, LEVEL + 14, E.back);
  const q = (n: number) => Math.round(n / PX) * PX; // keep DOM motion on the pixel grid
  return (
    <AbsoluteFill style={{ background: "#140c2b" }}>
      <canvas ref={ref} width={W} height={H} style={{ width: w, height: h, imageRendering: "pixelated" }} />
      <div style={{ position: "absolute", left: 48, top: 42, fontFamily: PIXEL, fontSize: v ? 30 : 34, color: "#fff", textShadow: `6px 6px 0 ${C.ink}`, lineHeight: 1.6 }}>
        SCORE <span style={{ color: C.yellow }}>{String(collected * 100).padStart(5, "0")}</span>
      </div>
      {JUMPS.map((j) => {
        const t = f - j;
        if (t < 0 || t > 20) return null;
        return <div key={j} style={{ position: "absolute", left: (CX - 2) * PX, top: q((GROUND - 34) * PX - t * 4), fontFamily: PIXEL, fontSize: 30, color: C.yellow, textShadow: `4px 4px 0 ${C.ink}`, opacity: t > 14 ? 0 : 1 }}>+100</div>;
      })}
      {f >= LEVEL && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `translateY(${q((1 - lv) * -400 - (v ? 200 : 250))}px) scale(${Math.max(0.01, lv)})`, textAlign: "center" }}>
            <div style={{ fontFamily: PIXEL, fontSize: v ? 84 : 120, color: C.yellow, textShadow: `0 10px 0 ${C.red}, 0 20px 0 ${C.ink}`, lineHeight: 1.2 }}>LEVEL{v ? <br /> : " "}UP!</div>
          </div>
        </AbsoluteFill>
      )}
      {/* scanlines */}
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 6px)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)" }} />
      <Flash at={LEVEL} color="#fff" len={6} />
      {bed && <Bed bars={44} />}
      {JUMPS.map((j) => <Sfx key={j} at={j} src="pop.wav" volume={0.7} />)}
      {JUMPS.map((j) => <Sfx key={"c" + j} at={j} src="clink.wav" volume={0.18} />)}
      <Sfx at={LEVEL} src="ding.wav" volume={0.5} />
      <Sfx at={LEVEL} src="fx_chimes.wav" volume={0.3} />
    </AbsoluteFill>
  );
};
