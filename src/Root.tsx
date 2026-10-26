import React from "react";
import { Composition, Folder } from "remotion";
import { FPS } from "./kit";
import { KineticType, KT_LEN } from "./KineticType";
import { LogoReveal, LR_LEN } from "./LogoReveal";
import { DataViz, DV_LEN } from "./DataViz";
import { Particles, PT_LEN } from "./Particles";
import { PixelArt, PX_LEN } from "./PixelArt";
import { UIMockup, UI_LEN } from "./UIMockup";
import { WaveField3D, WF_LEN } from "./WaveField3D";
import { Transitions, TR_LEN } from "./Transitions";
import { Reel, REEL_LEN } from "./Reel";

/**
 * Eight motion-graphic pieces made with Remotion + Claude Code, each a different technique, plus a reel that cuts
 * them together on the beat. Every piece also renders as 9:16 (same code, the layout checks if the frame is tall).
 *   npx remotion studio
 *   npx remotion render Reel out/reel.mp4 --gl=angle
 */
const PIECES: { id: string; C: React.FC<{ bed?: boolean }>; len: number }[] = [
  { id: "01-KineticType", C: KineticType, len: KT_LEN },
  { id: "02-LogoReveal", C: LogoReveal, len: LR_LEN },
  { id: "03-DataViz", C: DataViz, len: DV_LEN },
  { id: "04-Particles", C: Particles, len: PT_LEN },
  { id: "05-PixelArt", C: PixelArt, len: PX_LEN },
  { id: "06-UIMockup", C: UIMockup, len: UI_LEN },
  { id: "07-WaveField3D", C: WaveField3D, len: WF_LEN },
  { id: "08-Transitions", C: Transitions, len: TR_LEN },
];

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={REEL_LEN} fps={FPS} width={1920} height={1080} />
    <Folder name="Pieces-16x9">
      {PIECES.map((p) => <Composition key={p.id} id={p.id} component={p.C} defaultProps={{ bed: true }} durationInFrames={p.len} fps={FPS} width={1920} height={1080} />)}
    </Folder>
    <Folder name="Pieces-9x16">
      {PIECES.map((p) => <Composition key={p.id} id={p.id + "-V"} component={p.C} defaultProps={{ bed: true }} durationInFrames={p.len} fps={FPS} width={1080} height={1920} />)}
    </Folder>
  </>
);
