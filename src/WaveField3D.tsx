import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { b, Bed, C, E, Grain, HEAD, LABEL, lerp, Sfx, tw, useV } from "./kit";

/**
 * 07 Real 3D (three.js): a 46×46 field of blocks. Every second beat a shock ring runs out from a
 * new origin and lifts the blocks; the camera cranes over it. Title lands on the drop. 250 f.
 */
export const WF_LEN = 250;
const G = 46;
const PULSES: { f: number; x: number; z: number; a: number }[] = [
  { f: b(0), x: 0, z: 0, a: 3 }, { f: b(2), x: -12, z: -8, a: 2.4 }, { f: b(4), x: 12, z: 6, a: 2.6 }, { f: b(6), x: -6, z: 12, a: 2.4 },
  { f: b(8), x: 0, z: 0, a: 5.5 }, { f: b(10), x: 10, z: -10, a: 2.6 }, { f: b(12), x: -10, z: 4, a: 2.8 }, { f: b(14), x: 6, z: 12, a: 2.6 },
  { f: b(16), x: 0, z: 0, a: 4.5 },
];
const TITLE = b(8);

const heightAt = (x: number, z: number, f: number) => {
  let y = 0.35 + 0.35 * Math.sin(x * 0.28 + f * 0.06) * Math.cos(z * 0.24 - f * 0.05);
  for (const p of PULSES) {
    const t = f - p.f;
    if (t < 0) continue;
    const r = Math.hypot(x - p.x, z - p.z);
    const ring = t * 0.75;
    y += p.a * Math.exp(-((r - ring) ** 2) / 6) * Math.exp(-t / 34);
  }
  return y;
};

const Field: React.FC<{ f: number }> = ({ f }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const lo = useMemo(() => new THREE.Color("#2a2013"), []);
  const mid = useMemo(() => new THREE.Color(C.yellow), []);
  const hi = useMemo(() => new THREE.Color("#fff3c4"), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    let i = 0;
    for (let gx = 0; gx < G; gx++) for (let gz = 0; gz < G; gz++) {
      const x = gx - G / 2 + 0.5, z = gz - G / 2 + 0.5;
      const y = heightAt(x, z, f);
      tmp.position.set(x, y / 2, z);
      tmp.scale.set(0.86, Math.max(0.05, y), 0.86);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      const k = Math.min(1, Math.max(0, (y - 0.3) / 2.6));
      if (k < 0.6) col.copy(lo).lerp(mid, k / 0.6); else col.copy(mid).lerp(hi, (k - 0.6) / 0.4);
      m.setColorAt(i, col);
      i++;
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, G * G]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.38} metalness={0.15} />
    </instancedMesh>
  );
};

const Rig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = tw(f, 0, WF_LEN, E.inOut);
    const yaw = lerp(-0.9, 0.55, t);
    const dist = lerp(40, 27, t);
    const up = lerp(26, 13, t) + 3 * Math.sin(f * 0.03);
    camera.position.set(Math.sin(yaw) * dist, up, Math.cos(yaw) * dist);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

export const WaveField3D: React.FC<{ bed?: boolean }> = ({ bed = true }) => {
  const f = useCurrentFrame();
  const { w, h, v } = useV();
  const title = tw(f, TITLE, TITLE + 16, E.out);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 38, position: [0, 20, 40] }}>
        <color attach="background" args={[C.ink]} />
        <fog attach="fog" args={[C.ink, 28, 62]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[-14, 22, 10]} intensity={2.2} color="#fff1d0" />
        <pointLight position={[18, 6, -14]} intensity={260} color="#ff3a1a" distance={60} />
        <pointLight position={[0, 14, 0]} intensity={80 + 400 * Math.exp(-Math.max(0, f - b(8)) / 10) * (f >= b(8) ? 1 : 0)} color={C.yellow} distance={40} />
        <Rig f={f} />
        <Field f={f} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: `linear-gradient(to ${v ? "bottom" : "top"}, rgba(22,17,10,${0.85 * title}) 0%, transparent 45%)`, pointerEvents: "none" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: v ? "center" : "flex-end", paddingBottom: v ? 0 : 90, pointerEvents: "none" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: v ? 190 : 210, lineHeight: 0.9, color: C.paper, letterSpacing: `${lerp(0.3, 0.02, title)}em`, opacity: title, transform: `translateY(${(1 - title) * 40}%)`, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>THREE.JS</div>
        </div>
        <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 28, letterSpacing: "0.34em", color: C.yellow, opacity: tw(f, TITLE + 10, TITLE + 26), marginTop: 10, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
          2,116 BLOCKS · EVERY FRAME COMPUTED
        </div>
      </AbsoluteFill>
      <Grain opacity={0.06} />
      {bed && <Bed bars={60} />}
      {PULSES.map((p, i) => <Sfx key={i} at={p.f} src="thud.wav" volume={p.a > 4 ? 0.85 : 0.4} />)}
      <Sfx at={b(8) - 48} src="riser.wav" volume={0.35} />
      <Sfx at={b(8)} src="fx_magic.wav" volume={0.2} />
    </AbsoluteFill>
  );
};
