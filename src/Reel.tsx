import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bed, C, Flash, Sfx } from "./kit";
import { KineticType } from "./KineticType";
import { LogoReveal } from "./LogoReveal";
import { DataViz } from "./DataViz";
import { Particles } from "./Particles";
import { PixelArt } from "./PixelArt";
import { UIMockup } from "./UIMockup";
import { WaveField3D } from "./WaveField3D";
import { Transitions } from "./Transitions";

/**
 * The opening reel: the eight pieces cut together on one music bed. Every cut sits on a beat and
 * every piece keeps its own beat grid (reel frame − piece frame is a multiple of 2 beats = 25 f).
 */
type Seg = { C: React.FC<{ bed?: boolean }>; at: number; len: number; from: number };
export const SEGMENTS: Seg[] = [
  { C: KineticType, at: 0, len: 200, from: 0 },
  { C: Particles, at: 200, len: 150, from: 50 },
  { C: LogoReveal, at: 350, len: 200, from: 0 },
  { C: DataViz, at: 550, len: 200, from: 50 },
  { C: PixelArt, at: 750, len: 200, from: 100 },
  { C: UIMockup, at: 950, len: 200, from: 100 },
  { C: WaveField3D, at: 1150, len: 200, from: 0 },
  { C: Transitions, at: 1350, len: 175, from: 0 },
  { C: KineticType, at: 1525, len: 150, from: 150 },
];
const END = 1675;
export const REEL_LEN = END + 25;

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    {SEGMENTS.map(({ C: P, at, len, from }, i) => (
      <Sequence key={i} from={at} durationInFrames={len} name={P.name ?? String(i)}>
        <Sequence from={-from} layout="none"><P bed={false} /></Sequence>
      </Sequence>
    ))}
    <Sequence from={END}><AbsoluteFill style={{ background: C.yellow }} /></Sequence>
    {SEGMENTS.slice(1).map(({ at }) => <Flash key={at} at={at} color="#fff" len={4} />)}
    {SEGMENTS.slice(1).map(({ at }) => <Sfx key={"w" + at} at={at - 7} src="whoosh.wav" volume={0.3} />)}
    <Bed bars={0} volume={0.45} />
  </AbsoluteFill>
);
