# Prompts from the video

Paste these one by one into Claude Code (or Codex) in an empty folder.

## 1) INSTALL

Install Remotion and three.js in this folder so I can make motion graphics with code. Set up a new Remotion project and tell me when it's ready.


## 2) SKILL

Which Remotion skills do you have? Use the Remotion best practices for everything we make in this project.


## 3) MEMORY

Remember my brand for every video: yellow #FFC800, ink #16110A, red #9E1409, fonts Big Shoulders and Work Sans, punchy and on the beat.


## 4) THE PIECE

Make me a 10 second motion graphic for my video about AI motion graphics. Kinetic typography in my brand style, on the beat, with whoosh and pop sound effects, and render it.


## 5) SOUNDS

Make the whoosh and pop sound effects yourself with Python instead of using files. Tell me if I need to install anything.


## 6) IT FIXES ITSELF

Render 4 stills from the piece and look at them. Check for anything cut off, overlapping or hard to read, and fix what you find.


## 7) CHANGE IT IN PLAIN WORDS

Make the second half slower and the text bigger, and make the ending punchier.


## 8) VERTICAL

Make a 9 by 16 vertical version of this for Shorts and render it.


## 9) TRANSPARENT OVERLAY

Render the title part as a transparent overlay (ProRes 4444 with alpha) so I can put it on top of my videos in DaVinci.


10) SHOW THE RESULT  (end of the recording)

## Benchmark prompt

The exact prompt all three AIs got (Claude Opus 5.5, GPT-6 Luna, Flint):

```
# Task: one motion graphic, 10 seconds

You are in a Remotion 4 project. All dependencies are already installed in node_modules — do not install or update packages.

Make a 10-second motion graphic (1920x1080, 30 fps) on the theme "motion graphics made with AI".
Make it as impressive as you can — think of the best motion-design posts on Instagram: strong typography,
snappy easing, punchy pacing, real polish.

- Brand: yellow #FFC800, ink #16110A, red #9E1409. Fonts via @remotion/google-fonts (BigShoulders, WorkSans) — other fonts are fine too.
- Sound is part of the piece: use the music bed public/music/mood_ring.mp3 (144 BPM, first beat at 1.232 s into the file)
  and the sound effects in public/sfx/ (whoosh, pop, click, riser, thud, ding, clink, bell, fx_*.wav). Sync hits to the motion.
- Any on-screen claims must be true. No placeholder text.
- Entry point src/index.ts with registerRoot; composition id Bench.
- When it is done, render it yourself:
  npx remotion render src/index.ts Bench out/bench.mp4 --gl=angle
- Work on your own until out/bench.mp4 renders without errors. Do not ask questions.
```
