import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { b, Bed, C, E, Grain, HEAD, LABEL, lerp, Sfx, tw, useV } from "./kit";

/**
 * 03 Data animation: VRAM of GeForce RTX desktop cards (Nvidia spec sheets). Bars grow on the beat
 * with rolling counters, re-sort by size, then a 12 GB line and a push-in on the RTX 3060. 300 f.
 */
export const DV_LEN = 300;

// launch order: 3060 (Feb 2021), 4090 (Oct 2022), 4080 (Nov 2022), 4070 (Apr 2023), 4060 (Jun 2023), 5090 (Jan 2025)
const DATA = [
  { n: "RTX 3060", g: 12, mine: true },
  { n: "RTX 4090", g: 24 },
  { n: "RTX 4080", g: 16 },
  { n: "RTX 4070", g: 12 },
  { n: "RTX 4060", g: 8 },
  { n: "RTX 5090", g: 32 },
];
const SORTED = [...DATA].sort((a, z) => a.g - z.g || (a.mine ? -1 : 1)).map((d) => d.n);

const MAX = 32;

export const DataViz: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { v } = useV();
  // 16:9 and 9:16 layouts: plot box, title and callout positions
  const [X0, X1, TOP, BASE] = v ? [150, 1010, 700, 1480] : [330, 1650, 330, 900];
  const [TITLE_Y, SUB_Y, CALL_Y] = v ? [330, 452, 520] : [92, 212, 300];
  const yOf = (g: number) => BASE - ((BASE - TOP) * g) / MAX;
  const slot = (X1 - X0) / DATA.length;
  const bw = slot * 0.62;
  const sort = tw(f, b(8), b(10) + 6, E.inOut);
  const line = tw(f, b(12), b(13) + 6, E.inOut);
  const push = tw(f, b(16), b(19), E.inOut);
  const exit = tw(f, DV_LEN - 14, DV_LEN, E.in);
  const mineX = X0 + slot * (SORTED.indexOf("RTX 3060") + 0.5);
  const titleIn = tw(f, 0, 18);
  const swap = tw(f, b(8), b(8) + 10, E.inOut);

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: `${mineX}px ${yOf(12)}px`, transform: `scale(${lerp(1, v ? 1.08 : 1.18, push)})`, opacity: 1 - exit }}>
        {/* title */}
        <div style={{ position: "absolute", left: X0 - 10, top: TITLE_Y, opacity: 1 - push, fontFamily: HEAD, fontWeight: 900, fontSize: 120, lineHeight: 0.9, color: C.paper, overflow: "hidden" }}>
          <div style={{ transform: `translateY(${(1 - titleIn) * 100}%)` }}>VRAM <span style={{ color: C.yellow }}>(GB)</span></div>
        </div>
        <div style={{ position: "absolute", left: X0, top: SUB_Y, fontFamily: LABEL, fontWeight: 600, fontSize: v ? 22 : 26, letterSpacing: "0.22em", color: C.paper, opacity: 0.7 * tw(f, 8, 24) * (1 - push), height: 34, lineHeight: "34px", overflow: "hidden" }}>
          <div style={{ transform: `translateY(${-swap * 34}px)` }}>
            <div>GEFORCE RTX DESKTOP · BY LAUNCH DATE</div>
            <div style={{ color: C.yellow }}>GEFORCE RTX DESKTOP · SORTED BY VRAM</div>
          </div>
        </div>
        {/* grid */}
        {[0, 8, 16, 24, 32].map((g, i) => {
          const t = tw(f, 4 + i * 3, 26 + i * 3, E.out);
          return (
            <React.Fragment key={g}>
              <div style={{ position: "absolute", left: X0 - 20, top: yOf(g), width: (X1 - X0 + 40) * t, height: 2, background: g === 0 ? C.paper : "rgba(255,246,220,0.13)" }} />
              <div style={{ position: "absolute", left: X0 - 90, top: yOf(g) - 18, width: 50, textAlign: "right", fontFamily: LABEL, fontWeight: 600, fontSize: 26, color: C.paper, opacity: 0.55 * t }}>{g}</div>
            </React.Fragment>
          );
        })}
        {/* 12 GB line */}
        <div style={{ position: "absolute", left: X0 - 20, top: yOf(12) - 2, width: (X1 - X0 + 40) * line, height: 0, borderTop: `4px dashed ${C.red}` }} />
        <div style={{ position: "absolute", left: X1 - 120, top: yOf(12) - 52, fontFamily: HEAD, fontWeight: 900, fontSize: 38, color: C.red, opacity: tw(f, b(13), b(13) + 8), background: C.ink, padding: "0 8px" }}>12 GB</div>
        {/* bars */}
        {DATA.map((d, i) => {
          const st = b(2 + i);
          const grow = tw(f, st, st + 16, E.out);
          const x = X0 + slot * (lerp(i, SORTED.indexOf(d.n), sort) + 0.5);
          const hgt = (BASE - yOf(d.g)) * grow;
          const val = Math.round(d.g * tw(f, st, st + 16, E.out));
          const lift = Math.sin(Math.PI * sort) * -30 * (i % 2 ? 1 : -1);
          const hi = d.mine ? 1 : 0;
          const dim = d.mine ? 0 : 0.6 * push;
          return (
            <React.Fragment key={d.n}>
              <div style={{ position: "absolute", left: x - bw / 2, top: BASE - hgt + lift, width: bw, height: hgt, borderRadius: "10px 10px 0 0",
                background: hi ? C.yellow : d.g === 32 ? C.red : "#EDE2C4", opacity: 1 - dim,
                boxShadow: hi ? `0 0 ${60 * tw(f, b(12), b(14))}px rgba(255,200,0,0.55)` : undefined }} />
              <div style={{ position: "absolute", left: x - 100, width: 200, top: BASE - hgt - 78 + lift, textAlign: "center", fontFamily: HEAD, fontWeight: 900, fontSize: 70, lineHeight: 1,
                color: hi ? C.yellow : C.paper, opacity: grow > 0.02 ? 1 - dim : 0, fontVariantNumeric: "tabular-nums" }}>{val}</div>
              <div style={{ position: "absolute", left: x - 120, width: 240, top: BASE + 22, textAlign: "center", fontFamily: LABEL, fontWeight: 800, fontSize: v ? 32 : 28, letterSpacing: "0.04em",
                color: hi ? C.yellow : C.paper, opacity: tw(f, st, st + 10) * (1 - dim) }}>{v ? d.n.replace("RTX ", "") : d.n}</div>
            </React.Fragment>
          );
        })}
        {/* callout: sits in the empty space above the small cards, leader line down to the 3060 */}
        <div style={{ position: "absolute", left: mineX, top: CALL_Y + 120, width: 3, height: (yOf(12) - 90 - CALL_Y - 120) * tw(f, b(17), b(18), E.inOut), background: C.yellow }} />
        <div style={{ position: "absolute", left: mineX - 14, top: CALL_Y, opacity: tw(f, b(17), b(18)), transform: `translateY(${(1 - tw(f, b(17), b(18) + 6)) * 24}px)` }}>
          <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 22, letterSpacing: "0.25em", color: C.ink, background: C.yellow, padding: "6px 12px", display: "inline-block" }}>THE CARD IN MY PC</div>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: C.paper, lineHeight: 1.05, marginTop: 6 }}>RTX 3060 · 12 GB</div>
        </div>
      </AbsoluteFill>
      <Grain />
      {bed && <Bed bars={28} />}
      <Sfx at={0} src="whoosh.wav" volume={0.3} />
      {DATA.map((_, i) => <Sfx key={i} at={b(2 + i)} src="click.wav" volume={0.65} />)}
      <Sfx at={b(8) - 4} src="whoosh.wav" volume={0.45} />
      <Sfx at={b(12)} src="clink.wav" volume={0.4} />
      <Sfx at={b(17) + 4 - 48} src="riser.wav" volume={0.3} />
      <Sfx at={b(17) + 4} src="ding.wav" volume={0.35} />
    </AbsoluteFill>
  );
};
