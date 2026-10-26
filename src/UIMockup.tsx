import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { b, Bed, C, E, Grain, INTER, lerp, MONO, mix, Sfx, tw, useV } from "./kit";

/**
 * 06 UI mockup animation: a glassy prompt-to-video app. Cursor glides and clicks, the prompt types,
 * the button morphs into progress, result cards cascade in with a toast. 300 f.
 */
export const UI_LEN = 300;
const PROMPT = "kinetic logo reveal, yellow on black, 144 bpm";
const TYPE0 = b(4) + 4, TYPE1 = b(10) - 4;
const CLICK1 = b(4), CLICK2 = b(12), DONE = b(16);

/** window, prompt field, button and results area for 16:9 (button beside the field) or 9:16 (button below it) */
const layout = (v: boolean) => {
  const [WX, WY, WW, WH] = v ? [70, 300, 940, 1320] : [300, 150, 1320, 780];
  const INPUT = v ? { x: WX + 40, y: WY + 110, w: WW - 80, h: 92 } : { x: WX + 48, y: WY + 110, w: WW - 330, h: 92 };
  const BTN = v ? { x: WX + 40, y: WY + 222, w: WW - 80, h: 92 } : { x: WX + WW - 260, y: WY + 110, w: 212, h: 92 };
  const AREA = v ? { y: WY + 360, w: WW - 80, h: WH - 400 } : { y: WY + 250, w: WW - 96, h: WH - 300 };
  return { WX, WY, WW, WH, INPUT, BTN, AREA, cols: v ? 2 : 3, start: v ? [900, 1750] : [1700, 1000] };
};

const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <svg width={44} height={52} viewBox="0 0 22 26" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: "0 0", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}>
    <path d="M1 1 L1 20 L6 15.5 L9.5 23.5 L13 22 L9.6 14.2 L16 14.2 Z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

const Thumb: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const grads = [
    `linear-gradient(135deg, ${C.yellow}, #ff8a00)`, `linear-gradient(135deg, #2b2bff, #b347ff)`, `linear-gradient(135deg, ${C.red}, #ff4d4d)`,
    `linear-gradient(135deg, #00c2a8, #0066ff)`, `linear-gradient(135deg, #16110A, #4b3a1d)`, `linear-gradient(135deg, #ff5ea8, #ffc800)`,
  ];
  const t = f * 0.08 + i;
  return (
    <div style={{ position: "absolute", inset: 0, background: grads[i], overflow: "hidden" }}>
      {i % 3 === 0 && <div style={{ position: "absolute", width: 60, height: 60, borderRadius: 30, background: "rgba(255,255,255,0.9)", left: `${50 + 30 * Math.sin(t)}%`, top: `${50 - 25 * Math.abs(Math.cos(t * 1.3))}%`, transform: "translate(-50%,-50%)" }} />}
      {i % 3 === 1 && [0, 1, 2, 3, 4].map((k) => <div key={k} style={{ position: "absolute", bottom: 0, left: `${12 + k * 16}%`, width: "10%", height: `${30 + 40 * Math.abs(Math.sin(t + k * 0.7))}%`, background: "rgba(255,255,255,0.85)", borderRadius: "6px 6px 0 0" }} />)}
      {i % 3 === 2 && <div style={{ position: "absolute", left: "50%", top: "50%", width: 70, height: 70, border: "8px solid rgba(255,255,255,0.9)", transform: `translate(-50%,-50%) rotate(${t * 40}deg)`, borderRadius: 12 }} />}
    </div>
  );
};

export const UIMockup: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { v } = useV();
  const { WX, WY, WW, WH, INPUT, BTN, AREA, cols, start } = layout(v);
  const enter = tw(f, 0, 22, E.out);
  // cursor path
  const cx = mix(f, [b(2), CLICK1 - 4, b(10), CLICK2 - 4, DONE + 20, DONE + 44], [start[0], INPUT.x + 220, INPUT.x + 220, BTN.x + 120, BTN.x + 120, WX + 560], E.inOut);
  const cy = mix(f, [b(2), CLICK1 - 4, b(10), CLICK2 - 4, DONE + 20, DONE + 44], [start[1], INPUT.y + 52, INPUT.y + 52, BTN.y + 54, BTN.y + 54, WY + 420], E.inOut);
  const press = (k: number) => mix(f, [k - 3, k, k + 5], [0, 1, 0]);
  const p = Math.max(press(CLICK1), press(CLICK2));
  const typed = Math.floor(PROMPT.length * mix(f, [TYPE0, TYPE1], [0, 1]));
  const focus = tw(f, CLICK1, CLICK1 + 8);
  const prog = mix(f, [CLICK2 + 4, DONE - 2], [0, 1], E.inOut);
  const working = f >= CLICK2 && f < DONE;
  const done = f >= DONE;
  const toast = tw(f, DONE + 2, DONE + 16, E.back) * (1 - tw(f, UI_LEN - 30, UI_LEN - 16, E.in));
  const hover = tw(f, DONE + 40, DONE + 52, E.out);

  return (
    <AbsoluteFill style={{ background: "#07070b", overflow: "hidden", fontFamily: INTER }}>
      {/* drifting colour orbs behind the glass */}
      {[[C.yellow, 420, 300, 0], ["#6a3cff", 1500, 760, 2], [C.red, 1300, 200, 4]].map(([c, x, y, ph], i) => (
        <div key={i} style={{ position: "absolute", width: 820, height: 820, borderRadius: "50%", background: c as string, opacity: 0.32, filter: "blur(140px)",
          left: (x as number) - 410 + 80 * Math.sin(f * 0.02 + (ph as number)), top: (y as number) - 410 + 60 * Math.cos(f * 0.025 + (ph as number)) }} />
      ))}
      <div style={{ position: "absolute", left: WX, top: WY, width: WW, height: WH, borderRadius: 28, background: "rgba(22,22,30,0.62)", border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)", backdropFilter: "blur(30px)",
        opacity: enter, transform: `translateY(${(1 - enter) * 50}px) scale(${lerp(0.94, 1, enter)})`, filter: `blur(${(1 - enter) * 14}px)` }}>
        <div style={{ position: "absolute", left: 26, top: 24, display: "flex", gap: 10 }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 20, textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 18, fontWeight: 500 }}>prompt → video</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 64, height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>
      {/* input */}
      <div style={{ position: "absolute", left: INPUT.x, top: INPUT.y, width: INPUT.w, height: INPUT.h, borderRadius: 18, opacity: enter,
        background: "rgba(255,255,255,0.05)", border: `1.5px solid ${focus > 0 ? `rgba(255,200,0,${0.25 + 0.6 * focus})` : "rgba(255,255,255,0.12)"}`,
        boxShadow: `0 0 0 ${6 * focus}px rgba(255,200,0,0.12)`, display: "flex", alignItems: "center", padding: "0 30px", fontSize: 30, color: "#fff", fontWeight: 500 }}>
        {typed === 0 && !focus ? <span style={{ color: "rgba(255,255,255,0.35)" }}>Describe a motion graphic…</span> : (
          <span>{PROMPT.slice(0, typed)}<span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 3, verticalAlign: "middle", background: C.yellow, opacity: Math.floor(f / 8) % 2 || (f > TYPE0 && f < TYPE1) ? 1 : 0 }} /></span>
        )}
      </div>
      {/* button -> spinner */}
      <div style={{ position: "absolute", left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 18, opacity: enter, background: done ? "#1f2a1f" : C.yellow,
        transform: `scale(${1 - 0.05 * press(CLICK2)})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: done ? "#6cff8b" : C.ink, gap: 14 }}>
        {working ? <div style={{ width: 34, height: 34, borderRadius: 17, border: `4px solid ${C.ink}`, borderTopColor: "transparent", transform: `rotate(${f * 18}deg)` }} /> : done ? "✓ Done" : "Generate"}
      </div>
      {/* content area */}
      <div style={{ position: "absolute", left: INPUT.x, top: AREA.y, width: AREA.w, height: AREA.h }}>
        {!working && !done && <div style={{ position: "absolute", inset: 0, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 24, opacity: enter }}>Your renders appear here</div>}
        {working && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 120 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontSize: 24, fontWeight: 600 }}>
              <span>Rendering</span><span style={{ fontFamily: MONO, color: C.yellow }}>frame {String(Math.round(prog * 300)).padStart(3, "0")} / 300</span>
            </div>
            <div style={{ marginTop: 18, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 7, background: `linear-gradient(90deg, ${C.yellow}, #ff9d00, ${C.yellow})`, backgroundSize: "200% 100%", backgroundPosition: `${-f * 6}px 0` }} />
            </div>
            <div style={{ display: "flex", gap: 40, marginTop: 34 }}>
              {["Layout", "Audio sync", "Encode"].map((s, i) => {
                const t = tw(f, b(13 + i), b(13 + i) + 8, E.back);
                return <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.85)", fontSize: 22, opacity: Math.min(1, t * 2), transform: `translateY(${(1 - t) * 14}px)` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: "#28c840", color: "#07070b", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${t})` }}>✓</div>{s}</div>;
              })}
            </div>
          </div>
        )}
        {done && Array.from({ length: 6 }, (_, i) => {
          const t = tw(f, DONE + i * 3, DONE + i * 3 + 18, E.out);
          const col = i % cols, row = Math.floor(i / cols);
          const rows = 6 / cols;
          const cw = (AREA.w - 24 * (cols - 1)) / cols, ch = (AREA.h - 24 * (rows - 1)) / rows;
          const hv = i === 1 ? hover : 0;
          return (
            <div key={i} style={{ position: "absolute", left: col * (cw + 24), top: row * (ch + 24), width: cw, height: ch, borderRadius: 16, overflow: "hidden", opacity: t,
              transform: `perspective(900px) translateY(${(1 - t) * 60}px) rotateX(${(1 - t) * 35}deg) scale(${1 + 0.05 * hv})`,
              boxShadow: hv ? `0 30px 60px rgba(0,0,0,0.55), 0 0 0 3px ${C.yellow}` : "0 10px 30px rgba(0,0,0,0.35)", zIndex: hv ? 2 : 1 }}>
              <Thumb i={i} f={f} />
              <div style={{ position: "absolute", left: 14, bottom: 12, fontFamily: MONO, fontSize: 16, color: "rgba(255,255,255,0.9)", background: "rgba(0,0,0,0.35)", padding: "3px 8px", borderRadius: 6 }}>take_{i + 1}.mp4</div>
            </div>
          );
        })}
      </div>
      {/* toast */}
      <div style={{ position: "absolute", right: 60, top: 50, width: 400, padding: "20px 24px", borderRadius: 18, background: "rgba(30,30,40,0.85)", border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 16, transform: `translateX(${(1 - toast) * 480}px)`, opacity: Math.min(1, toast * 1.5) }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: "#28c840", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#07070b" }}>✓</div>
        <div><div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>Render complete</div><div style={{ color: "rgba(255,255,255,0.55)", fontSize: 18, marginTop: 2 }}>6 takes · 1920×1080</div></div>
      </div>
      {f >= b(2) && <Cursor x={cx} y={cy} press={p} />}
      {[CLICK1, CLICK2].map((k) => {
        const t = tw(f, k, k + 16, E.out);
        if (f < k || t >= 1) return null;
        const x = k === CLICK1 ? INPUT.x + 220 : BTN.x + 120, y = k === CLICK1 ? INPUT.y + 52 : BTN.y + 54;
        return <div key={k} style={{ position: "absolute", left: x - 40 * t, top: y - 40 * t, width: 80 * t, height: 80 * t, borderRadius: "50%", border: `3px solid rgba(255,200,0,${1 - t})` }} />;
      })}
      <Grain opacity={0.05} vignette={0.3} />
      {bed && <Bed bars={52} />}
      <Sfx at={0} src="whoosh.wav" volume={0.3} />
      <Sfx at={CLICK1} src="click.wav" volume={0.7} />
      {Array.from({ length: Math.floor(PROMPT.length / 3) }, (_, i) => <Sfx key={i} at={Math.round(TYPE0 + ((TYPE1 - TYPE0) * i * 3) / PROMPT.length)} src="click.wav" volume={0.14} />)}
      <Sfx at={CLICK2} src="click.wav" volume={0.8} />
      {[13, 14, 15].map((n) => <Sfx key={n} at={b(n)} src="pop.wav" volume={0.5} />)}
      <Sfx at={DONE} src="thud.wav" volume={0.5} />
      <Sfx at={DONE + 2} src="ding.wav" volume={0.4} />
    </AbsoluteFill>
  );
};
