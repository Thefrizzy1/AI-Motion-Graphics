import React from "react";
import { AbsoluteFill, Audio, Easing, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadHead } from "@remotion/google-fonts/BigShoulders";
import { loadFont as loadLabel } from "@remotion/google-fonts/WorkSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

/**
 * Kit for all pieces: brand colours, fonts, easing, and the music grid.
 * Everything is timed on a 144 BPM beat: at 30 fps one beat = 12.5 frames, one bar = 50 frames.
 * Music: put your own track at public/music/bed.mp3 (measure it with scripts/bpm.py and set MUSIC_FIRST_BEAT).
 * Without it the pieces render with their sound effects only.
 */
export const FPS = 30;
export const BEAT = 12.5;
export const BAR = 50;
export const b = (n: number) => Math.round(n * BEAT);
export const MUSIC = "music/bed.mp3";
export const MUSIC_FIRST_BEAT = 37; // frames into the file where the first beat is (here 1.232 s)

export const C = { yellow: "#FFC800", ink: "#16110A", red: "#9E1409", paper: "#FFF6DC", white: "#FFFFFF" };

export const HEAD = loadHead("normal", { weights: ["700", "900"], subsets: ["latin"] }).fontFamily;
export const LABEL = loadLabel("normal", { weights: ["400", "600", "800"], subsets: ["latin"] }).fontFamily;
export const INTER = loadInter("normal", { weights: ["400", "500", "600", "800"], subsets: ["latin"] }).fontFamily;
export const PIXEL = loadPixel("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const SERIF = loadSerif("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const SERIF_I = loadSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;

export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out: fast in, long settle
  inOut: Easing.bezier(0.83, 0, 0.17, 1), // snappy quint in-out
  in: Easing.bezier(0.7, 0, 0.84, 0),
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // slight overshoot
};
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** eased 0..1 between frames a and b */
export const tw = (f: number, a: number, z: number, ease = E.out) => interpolate(f, [a, z], [0, 1], { ...cl, easing: ease });
export const lerp = (a: number, z: number, t: number) => a + (z - a) * t;
export const mix = (f: number, keys: number[], vals: number[], ease?: (t: number) => number) => interpolate(f, keys, vals, { ...cl, easing: ease });

/** deterministic random */
export const rand = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.5 }) =>
  <Sequence from={at} layout="none"><Audio src={staticFile("sfx/" + src)} volume={volume} /></Sequence>;

/** the music bed, starting on a beat. `bars` = how many bars into the song to start. */
export const Bed: React.FC<{ bars?: number; volume?: number }> = ({ bars = 0, volume = 0.42 }) => {
  const { durationInFrames } = useVideoConfig();
  if (!getStaticFiles().some((f) => f.name === MUSIC)) return null;   // no music file: sound effects only
  return <Audio src={staticFile(MUSIC)} trimBefore={MUSIC_FIRST_BEAT + bars * BAR}
    volume={(f) => volume * interpolate(f, [0, 4, durationInFrames - 20, durationInFrames], [0, 1, 1, 0], cl)} />;
};

/** film grain + vignette on top of everything: hides banding, makes flat colour feel shot */
export const Grain: React.FC<{ opacity?: number; vignette?: number }> = ({ opacity = 0.07, vignette = 0.35 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignette}) 100%)` }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity, mixBlendMode: "overlay" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** a short flash that sells a hard cut */
export const Flash: React.FC<{ at: number; color?: string; len?: number }> = ({ at, color = "#fff", len = 5 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 1, at + len], [0, 0.85, 0], cl);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} /> : null;
};

export const useV = () => { const { width, height } = useVideoConfig(); return { w: width, h: height, v: height > width }; };
