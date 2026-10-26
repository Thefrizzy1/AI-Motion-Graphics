import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { b, Bed, C, E, Flash, Grain, HEAD, LABEL, lerp, rand, Sfx, tw, useV } from "./kit";

/**
 * 02 Logo reveal: a line becomes a square, the square fills, an F builds bar by bar on the beat,
 * then the mark slides aside for the wordmark with a light sweep. 250 f = 5 bars.
 */
export const LR_LEN = 250;

export const LogoReveal: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { w, h, v } = useV();
  const S = v ? 300 : 280; // mark size
  const line = tw(f, 0, 20, E.out) * (1 - tw(f, b(2), b(2) + 14, E.inOut));
  const draw = tw(f, b(2), b(4), E.inOut);
  const rot = lerp(45, 0, tw(f, b(2), b(4) + 6, E.inOut));
  const fill = tw(f, b(4), b(4) + 16, E.out);
  const bars = [b(5), b(6), b(7)].map((s) => tw(f, s, s + 10, E.out));
  const slide = tw(f, b(8), b(8) + 22, E.inOut);
  const markX = v ? 0 : lerp(0, -S * 1.75, slide);
  const markY = v ? lerp(0, -S * 0.75, slide) : 0;
  const markScale = lerp(1, 0.86, slide) * (1 + 0.08 * (1 - tw(f, b(4), b(4) + 10, E.out)) * (f >= b(4) ? 1 : 0));
  const glow = tw(f, b(4), b(4) + 12) * (1 - 0.5 * tw(f, b(8), b(12)));
  const exit = tw(f, LR_LEN - 16, LR_LEN, E.in);
  const per = 4 * S;

  const word = "the_frizzy1";
  const wfs = v ? 150 : 190;
  const sweep = lerp(-40, 140, tw(f, b(10), b(13), E.inOut));
  const tag = tw(f, b(10) + 4, b(11) + 8);

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,200,0,${0.22 * glow}) 0%, transparent 45%)` }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(rgba(255,246,220,0.09) 1.5px, transparent 1.5px)`, backgroundSize: "36px 36px", opacity: 0.8 }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - exit, transform: `scale(${1 - 0.04 * exit})` }}>
        {/* the mark */}
        <div style={{ position: "absolute", width: S, height: S, transform: `translate(${markX}px, ${markY}px) scale(${markScale}) rotate(${rot}deg)` }}>
          <div style={{ position: "absolute", left: S / 2, top: S / 2 - 3, height: 6, width: S * 1.6 * line, marginLeft: -S * 0.8 * line, background: C.yellow, transform: `rotate(${-rot}deg)` }} />
          <svg width={S} height={S} style={{ position: "absolute", overflow: "visible" }}>
            <rect x={3} y={3} width={S - 6} height={S - 6} rx={S * 0.12} fill="none" stroke={C.yellow} strokeWidth={6}
              strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
          </svg>
          <div style={{ position: "absolute", inset: 0, borderRadius: S * 0.12, background: C.yellow, clipPath: `circle(${fill * 75}% at 50% 50%)` }}>
            {/* F built from three bars */}
            <div style={{ position: "absolute", left: S * 0.3, top: S * 0.2, width: S * 0.13, height: S * 0.6, background: C.ink, transform: `scaleY(${bars[0]})`, transformOrigin: "50% 100%" }} />
            <div style={{ position: "absolute", left: S * 0.3, top: S * 0.2, width: S * 0.42, height: S * 0.13, background: C.ink, transform: `scaleX(${bars[1]})`, transformOrigin: "0 50%" }} />
            <div style={{ position: "absolute", left: S * 0.3, top: S * 0.44, width: S * 0.32, height: S * 0.12, background: C.ink, transform: `scaleX(${bars[2]})`, transformOrigin: "0 50%" }} />
            <div style={{ position: "absolute", left: S * 0.66, top: S * 0.62, width: S * 0.12, height: S * 0.12, background: C.red, transform: `scale(${tw(f, b(7) + 6, b(7) + 16, E.back)})` }} />
          </div>
        </div>
        {/* shards on the slide */}
        {Array.from({ length: 22 }, (_, i) => {
          const t = tw(f, b(8), b(8) + 34, E.out);
          if (t <= 0 || t >= 1) return null;
          const a = rand(i) * Math.PI * 2;
          const d = (260 + rand(i + 50) * 620) * t;
          const sz = 8 + rand(i + 9) * 22;
          return <div key={i} style={{ position: "absolute", width: sz, height: sz, background: i % 4 === 0 ? C.red : C.yellow, opacity: 1 - t,
            transform: `translate(${markX + Math.cos(a) * d}px, ${markY + Math.sin(a) * d}px) rotate(${t * 400 * (rand(i + 3) - 0.5)}deg)` }} />;
        })}
        {/* wordmark */}
        <div style={{ position: "absolute", transform: v ? `translateY(${S * 0.55}px)` : `translateX(${S * 0.55}px)`, display: "flex", flexDirection: "column", alignItems: v ? "center" : "flex-start" }}>
          <div style={{ position: "relative", overflow: "hidden", fontFamily: HEAD, fontWeight: 900, fontSize: wfs, lineHeight: 1, color: C.paper, display: "flex", paddingBottom: 6 }}>
            {word.split("").map((ch, i) => (
              <span key={i} style={{ display: "inline-block", color: i === word.length - 1 ? C.yellow : C.paper,
                transform: `translateY(${lerp(110, 0, tw(f, b(8) + 6 + i * 1.6, b(8) + 22 + i * 1.6, E.out))}%)` }}>{ch}</span>
            ))}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,0.75) ${sweep}%, transparent ${sweep + 12}%)`, mixBlendMode: "overlay" }} />
          </div>
          <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: v ? 28 : 30, letterSpacing: "0.34em", color: C.yellow, opacity: tag, transform: `translateY(${(1 - tag) * 16}px)`, marginTop: 6 }}>
            OPEN AI MODELS · RUN LOCALLY
          </div>
        </div>
      </AbsoluteFill>
      <Flash at={b(4)} color={C.yellow} len={5} />
      <Grain />
      {bed && <Bed bars={20} />}
      <Sfx at={0} src="click.wav" volume={0.6} />
      <Sfx at={b(2)} src="whoosh.wav" volume={0.3} />
      <Sfx at={b(4)} src="thud.wav" volume={0.7} />
      {[5, 6, 7].map((n) => <Sfx key={n} at={b(n)} src="click.wav" volume={0.7} />)}
      <Sfx at={b(7) + 6} src="pop.wav" volume={0.6} />
      <Sfx at={b(8) - 6} src="whoosh.wav" volume={0.5} />
      <Sfx at={b(8)} src="thud.wav" volume={0.6} />
      <Sfx at={b(10)} src="fx_chimes.wav" volume={0.25} />
    </AbsoluteFill>
  );
};
