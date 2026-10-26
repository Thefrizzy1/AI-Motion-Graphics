import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { b, Bed, C, E, Flash, Grain, HEAD, LABEL, lerp, MONO, rand, Sfx, tw, useV } from "./kit";

/**
 * 01 Kinetic typography: one idea per beat. Letters drop, mask-rise, march in marquee bands,
 * then single words punch on every beat before the lockup. 300 f = 6 bars.
 */
export const KT_LEN = 300;

/** horizontal-slice glitch for a few frames around a cut */
const Glitch: React.FC<{ cuts: number[]; children: React.ReactNode }> = ({ cuts, children }) => {
  const f = useCurrentFrame();
  const c = cuts.find((x) => f >= x - 1 && f < x + 3);
  if (c === undefined) return <AbsoluteFill>{children}</AbsoluteFill>;
  const n = 7;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const dx = (rand(i * 13 + f) - 0.5) * 160;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${(i / n) * 100}% 0 ${100 - ((i + 1) / n) * 100}% 0)`, transform: `translateX(${dx}px)` }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const Center: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) =>
  <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>{children}</AbsoluteFill>;

const Drop: React.FC<{ f: number; text: string; fs: number; color: string }> = ({ f, text, fs, color }) => (
  <div style={{ display: "flex", fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 0.82, color, letterSpacing: "-0.01em" }}>
    {text.split("").map((ch, i) => {
      const t = tw(f, i * 2, i * 2 + 16, E.out);
      const land = tw(f, i * 2 + 6, i * 2 + 14, E.out);
      return (
        <span key={i} style={{
          display: "inline-block",
          transform: `translateY(${lerp(-1.3 * fs, 0, t)}px) rotate(${lerp((rand(i) - 0.5) * 40, 0, t)}deg) scaleY(${1 + 0.18 * (1 - land) * (t > 0.6 ? 1 : 0)})`,
          transformOrigin: "50% 100%",
        }}>{ch}</span>
      );
    })}
  </div>
);

const Rise: React.FC<{ f: number; text: string; fs: number; color: string }> = ({ f, text, fs, color }) => (
  <div style={{ display: "flex", fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 0.9, color, overflow: "hidden", paddingTop: fs * 0.04 }}>
    {text.split("").map((ch, i) => (
      <span key={i} style={{ display: "inline-block", transform: `translateY(${lerp(105, 0, tw(f, i * 1.5, i * 1.5 + 14, E.out))}%)` }}>{ch}</span>
    ))}
  </div>
);

const Marquee: React.FC<{ f: number; w: number; h: number }> = ({ f, w, h }) => {
  const bands = 3;
  const bh = h / bands;
  const unit = "MADE WITH CODE • ";
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {Array.from({ length: bands }, (_, i) => {
        const dir = i % 2 ? 1 : -1;
        const enter = lerp(dir * w, 0, tw(f, i * 3, i * 3 + 18, E.out));
        const drift = dir * -f * 9;
        const filled = i === 1;
        return (
          <div key={i} style={{ position: "absolute", top: i * bh, height: bh, width: w, overflow: "hidden", background: filled ? C.yellow : C.ink }}>
            <div style={{
              position: "absolute", left: -w, whiteSpace: "nowrap", fontFamily: HEAD, fontWeight: 900, fontSize: bh * 0.86, lineHeight: `${bh}px`,
              transform: `translateX(${enter + drift}px)`,
              color: filled ? C.ink : "transparent", WebkitTextStroke: filled ? undefined : `3px ${C.yellow}`,
            }}>{unit.repeat(8)}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const WORDS = [
  { t: "EVERY", bg: C.ink, fg: C.yellow },
  { t: "FRAME", bg: C.yellow, fg: C.ink },
  { t: "IS", bg: C.red, fg: C.paper },
  { t: "CODE", bg: C.yellow, fg: C.ink },
];

const Lockup: React.FC<{ f: number; w: number; h: number; v: boolean; total: number }> = ({ f, w, h, v, total }) => {
  const track = lerp(0.45, 0.01, tw(f, 0, 34, E.out));
  const fs = v ? w * 0.27 : h * 0.3;
  const bar = tw(f, 14, 34, E.inOut);
  const cap = tw(f, 24, 44, E.out);
  const exit = tw(f, 76, 98, E.inOut);
  return (
    <AbsoluteFill style={{ background: C.ink, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ transform: `translateY(${-exit * h * 0.15}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 0.86, color: C.yellow, letterSpacing: `${track}em`, opacity: tw(f, 0, 8), textAlign: "center", whiteSpace: v ? "normal" : "nowrap", width: v ? w * 0.9 : undefined }}>
          AI MOTION
        </div>
        <div style={{ height: fs * 0.07, width: v ? w * 0.7 : fs * 3.6, background: C.red, marginTop: fs * 0.08, transform: `scaleX(${bar})`, transformOrigin: "0 50%" }} />
        <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: v ? 34 : 34, letterSpacing: "0.32em", color: C.paper, marginTop: 34, opacity: cap, transform: `translateY(${(1 - cap) * 24}px)`, textTransform: "uppercase" }}>
          made with Remotion + Claude Code
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, bottom: 48, fontFamily: MONO, fontSize: 22, color: C.yellow, opacity: 0.75 * cap }}>
        FRAME {String(f + 200).padStart(4, "0")} / {String(total).padStart(4, "0")}
      </div>
      <AbsoluteFill style={{ background: C.yellow, transform: `translateY(${(1 - exit) * 100}%)` }} />
    </AbsoluteFill>
  );
};

export const KineticType: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { w, h, v } = useV();
  let scene: React.ReactNode;
  if (f < b(4)) scene = <Center bg={C.ink}><Drop f={f} text="MOTION" fs={v ? w * 0.29 : h * 0.42} color={C.yellow} /></Center>;
  else if (f < b(8)) scene = <Center bg={C.yellow}><Rise f={f - b(4)} text="GRAPHICS" fs={v ? w * 0.21 : h * 0.34} color={C.ink} /></Center>;
  else if (f < b(12)) scene = <Marquee f={f - b(8)} w={w} h={h} />;
  else if (f < b(16)) {
    const i = Math.min(3, Math.floor((f - b(12)) / 12.5));
    const st = b(12 + i);
    const wd = WORDS[i];
    const punch = 1 + 0.22 * (1 - tw(f, st, st + 9, E.out));
    const fs = Math.min((w * 0.86) / (wd.t.length * 0.52), h * 0.72);
    scene = <Center bg={wd.bg}><div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 0.9, color: wd.fg, transform: `scale(${punch})` }}>{wd.t}</div></Center>;
  } else scene = <Lockup f={f - b(16)} w={w} h={h} v={v} total={KT_LEN} />;

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Glitch cuts={[b(4), b(8), b(12), b(16)]}>{scene}</Glitch>
      <Flash at={b(16)} color={C.yellow} len={6} />
      <Grain />
      {bed && <Bed bars={8} />}
      <Sfx at={0} src="thud.wav" volume={0.7} />
      <Sfx at={b(4) - 7} src="whoosh.wav" volume={0.45} />
      <Sfx at={b(4)} src="pop.wav" volume={0.6} />
      <Sfx at={b(8) - 7} src="whoosh.wav" volume={0.45} />
      {[12, 13, 14, 15].map((n) => <Sfx key={n} at={b(n)} src="click.wav" volume={0.7} />)}
      <Sfx at={b(12) - 2} src="riser.wav" volume={0.35} />
      <Sfx at={b(16)} src="thud.wav" volume={0.8} />
      <Sfx at={b(16)} src="ding.wav" volume={0.35} />
      <Sfx at={b(16) + 76} src="whoosh.wav" volume={0.4} />
    </AbsoluteFill>
  );
};
