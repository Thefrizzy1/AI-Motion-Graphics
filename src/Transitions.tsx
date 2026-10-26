import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BAR, Bed, C, E, Grain, HEAD, lerp, MONO, rand, Sfx, tw, useV } from "./kit";

/**
 * 08 Transition pack: six hand-built transitions, one per bar, each naming itself and the CSS
 * trick behind it. 350 f = 7 bars.
 */
export const TR_LEN = 350;
const SCENES = [
  { word: "TRANSITIONS", bg: C.ink, fg: C.yellow, code: "six of them, one per bar" },
  { word: "IRIS", bg: C.yellow, fg: C.ink, code: "clip-path: circle()" },
  { word: "SLICE", bg: C.red, fg: C.paper, code: "clip-path: polygon()" },
  { word: "SPLIT", bg: C.paper, fg: C.ink, code: "two halves, translateY" },
  { word: "BLINDS", bg: "#2340ff", fg: "#fff", code: "12 strips, staggered scaleX" },
  { word: "PIXELS", bg: C.ink, fg: C.yellow, code: "144 tiles, random order" },
  { word: "PUSH", bg: C.yellow, fg: C.ink, code: "translateX + motion blur" },
];

const Scene: React.FC<{ i: number; local: number }> = ({ i, local }) => {
  const { w, h, v } = useV();
  const s = SCENES[i];
  const fs = Math.min((w * 0.84) / (s.word.length * 0.5), h * (v ? 0.3 : 0.62));
  return (
    <AbsoluteFill style={{ background: s.bg, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ display: "flex", overflow: "hidden", fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 0.92, color: s.fg }}>
        {s.word.split("").map((ch, k) => (
          <span key={k} style={{ display: "inline-block", transform: `translateY(${lerp(100, 0, tw(local, 2 + k * 1.5, 16 + k * 1.5, E.out))}%)` }}>{ch}</span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 52, fontFamily: MONO, fontSize: 28, color: s.fg, opacity: 0.8 * tw(local, 8, 18) }}>{s.code}</div>
      <div style={{ position: "absolute", right: 60, top: 50, fontFamily: MONO, fontSize: 24, color: s.fg, opacity: 0.6 }}>{String(i).padStart(2, "0")} / 06</div>
    </AbsoluteFill>
  );
};

export const Transitions: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { w, h } = useV();
  const i = Math.min(SCENES.length - 1, Math.floor((f + 8) / BAR));
  const cut = i * BAR;
  const t = i === 0 ? 1 : tw(f, cut - 8, cut + 8, E.inOut);
  const cur = <Scene i={i} local={f - cut + 8} />;
  const prev = i > 0 ? <Scene i={i - 1} local={f - (i - 1) * BAR + 8} /> : null;

  let body: React.ReactNode = cur;
  if (prev && t < 1) {
    if (i === 1) body = <>{prev}<AbsoluteFill style={{ clipPath: `circle(${t * 75}% at 50% 50%)` }}>{cur}</AbsoluteFill></>;
    else if (i === 2) { const x = lerp(-0.4, 1.4, t) * w; body = <>{prev}<AbsoluteFill style={{ clipPath: `polygon(0 0, ${x + h * 0.4}px 0, ${x - h * 0.4}px 100%, 0 100%)` }}>{cur}</AbsoluteFill></>; }
    else if (i === 3) body = <>{cur}
      <AbsoluteFill style={{ clipPath: "inset(0 0 50% 0)", transform: `translateY(${-t * 52}%)` }}>{prev}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(50% 0 0 0)", transform: `translateY(${t * 52}%)` }}>{prev}</AbsoluteFill></>;
    else if (i === 4) { const n = 12; body = <>{prev}{Array.from({ length: n }, (_, k) => {
      const tk = tw(f, cut - 10 + k * 1.3, cut + 2 + k * 1.3, E.inOut);
      const x0 = (k / n) * 100, x1 = ((k + 1) / n) * 100;
      return <AbsoluteFill key={k} style={{ clipPath: `polygon(${x0}% 0, ${lerp(x0, x1, tk)}% 0, ${lerp(x0, x1, tk)}% 100%, ${x0}% 100%)` }}>{cur}</AbsoluteFill>;
    })}</>; }
    else if (i === 5) { const cols = 16, rows = 9; body = <>{prev}
      <AbsoluteFill style={{ clipPath: `path('${Array.from({ length: cols * rows }, (_, k) => {
        if (rand(k * 3.7) > t * 1.15 - 0.05) return "";
        const cx = (k % cols) * (w / cols), cy = Math.floor(k / cols) * (h / rows);
        return `M${cx} ${cy}h${w / cols + 1}v${h / rows + 1}h${-(w / cols + 1)}Z`;
      }).join("")}M0 0h1v1h-1Z')` }}>{cur}</AbsoluteFill></>; }
    else if (i === 6) body = <>
      <AbsoluteFill style={{ transform: `translateX(${-t * 100}%)`, filter: `blur(${Math.sin(Math.PI * t) * 18}px)` }}>{prev}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${(1 - t) * 100}%)`, filter: `blur(${Math.sin(Math.PI * t) * 18}px)` }}>{cur}</AbsoluteFill></>;
  }
  const out = tw(f, TR_LEN - 12, TR_LEN, E.in);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ opacity: 1 - out }}>{body}</AbsoluteFill>
      <Grain />
      {bed && <Bed bars={68} />}
      <Sfx at={0} src="thud.wav" volume={0.6} />
      {[1, 2, 3, 4, 5, 6].map((k) => <Sfx key={k} at={k * BAR - 10} src="whoosh.wav" volume={0.5} />)}
      {[1, 2, 3, 4, 5, 6].map((k) => <Sfx key={"p" + k} at={k * BAR} src={k % 2 ? "pop.wav" : "click.wav"} volume={0.55} />)}
    </AbsoluteFill>
  );
};
