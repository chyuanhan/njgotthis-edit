import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { NJ, clamp, bounce, exitPop, glide, IconBubble, LabelPill, Badge, SparkIcon, EyeIcon, FlagIcon, TrashIcon, NjBot } from "./nj-kit.jsx";

// Three beats, following the user's sketch:
// 1) a messy pile of letters bursts out above the speaker,
// 2) an "AI" node pops up in the middle and pulls every letter in,
// 3) the AI rises to the top and sorts them down three lines into three baskets.

const GREY = "linear-gradient(60deg, #CBD5E1 0%, #94A3B8 100%)";
const VIOLET_SOFT = "linear-gradient(60deg, #A78BFA 0%, #6366F1 100%)";

// The messy pile: [x, y, rotation, width, stroke colour, unread dot]
const PILE = [
  [124, 86, -18, 132, NJ.violet, true],
  [270, 50, 12, 108, NJ.cyan, false],
  [398, 116, -8, 142, NJ.violet, true],
  [530, 54, 20, 112, "#94A3B8", false],
  [660, 110, -14, 136, NJ.cyan, true],
  [800, 60, 9, 118, NJ.violet, false],
  [900, 140, -22, 108, "#94A3B8", true],
  [176, 250, 15, 120, NJ.cyan, false],
  [320, 300, -10, 136, "#94A3B8", true],
  [470, 262, 7, 112, NJ.violet, false],
  [620, 312, -16, 130, NJ.cyan, true],
  [770, 258, 13, 142, NJ.violet, false],
  [892, 330, -6, 112, NJ.cyan, false],
  [84, 366, 8, 104, NJ.violet, true],
];

const BASKET_X = [190, 500, 810];
const BASKET_TOP = 224;
const AI_MID = { x: 500, y: 196 };
const AI_TOP = { x: 500, y: 72 };

const mix = (a, b, u) => a + (b - a) * u;

// Point on the curve that runs from under the AI node down to a basket.
function onLine(bx, ay, u) {
  const p0 = [500, ay + 64];
  const p1 = [500, ay + 122];
  const p2 = [bx, BASKET_TOP - 66];
  const p3 = [bx, BASKET_TOP + 6];
  const v = 1 - u;
  return [
    v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
    v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1],
  ];
}

function linePath(bx, ay, upTo) {
  const steps = 18;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const [x, y] = onLine(bx, ay, (i / steps) * upTo);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
}

function Envelope({ w, stroke, dot }) {
  const h = w * 0.7;
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        boxSizing: "border-box",
        borderRadius: w * 0.13,
        backgroundColor: NJ.paper,
        border: `${Math.max(4, w * 0.055)}px solid ${stroke}`,
        boxShadow: "0 12px 22px -8px rgba(15, 23, 42, 0.45)",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 70" fill="none" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M6 8 L50 40 L94 8" stroke={stroke} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {dot ? (
        <div
          style={{
            position: "absolute",
            right: -w * 0.1,
            top: -w * 0.1,
            width: w * 0.26,
            height: w * 0.26,
            borderRadius: "50%",
            backgroundColor: NJ.strike,
            border: "4px solid #FFFFFF",
            boxSizing: "border-box",
          }}
        />
      ) : null}
    </div>
  );
}

function Basket({ tint, Icon, filled, bump, stroke }) {
  return (
    <div style={{ position: "relative", width: 212, height: 134 }}>
      {[0, 1].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: k === 0 ? 26 : 98,
            top: k === 0 ? -8 : -18,
            opacity: filled > k ? 1 : 0,
            transform: `rotate(${k === 0 ? -13 : 11}deg) scale(${filled > k ? 1 : 0.4})`,
          }}
        >
          <Envelope w={88} stroke={stroke} />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 104,
          boxSizing: "border-box",
          borderRadius: "20px 20px 42px 42px",
          backgroundImage: tint,
          border: "7px solid #FFFFFF",
          boxShadow: "0 22px 40px -14px rgba(91, 84, 232, 0.8), 0 8px 16px rgba(15, 23, 42, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          paddingTop: 10,
          transform: `scale(${bump})`,
          transformOrigin: "50% 100%",
        }}
      >
        <div style={{ width: 144, height: 9, borderRadius: 5, backgroundColor: "rgba(255, 255, 255, 0.5)" }} />
        <Icon size={58} color="#FFFFFF" />
      </div>
    </div>
  );
}

export default function SortBaskets({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;

  // ---- AI node: pops in the middle of the mess, then rises to the top ----
  // With a bot image the NJ bot itself plays the AI node.
  const withBot = !!p.botImage && !p.hideAi;
  const aiIn = bounce(t, p.aiTime, fps);
  const rise = glide(t, p.time1 - 0.32, p.time1 - 0.02);
  const ai = { x: mix(AI_MID.x, AI_TOP.x, rise), y: mix(AI_MID.y, withBot ? 84 : AI_TOP.y, rise) };
  const aiSize = mix(180, 132, rise);
  const aiOut = exitPop(t, dur - 0.1, 0.3);

  // ---- NJ bot acting: surprised by the mess, concentrates while pulling the letters in,
  // then turns to each basket as it fills it, and smiles once everything is sorted. ----
  const botW = mix(196, 142, rise);
  const turn = (a) => glide(t, a - 0.12, a + 0.16);
  const lookX = rise > 0 ? -turn(p.time1) + turn(p.time2) + turn(p.time3) : Math.sin(t * 7) * 0.5;
  const sortedAt = p.time3 + 0.4;
  const botMode = t < p.gatherTime ? "wide" : t < p.time1 - 0.32 ? "focused" : t < sortedAt ? "normal" : "happy";
  const bt = (t + 1.1) % 2.3;
  const botBlink = bt < 0.14 ? Math.sin((Math.PI * bt) / 0.14) : 0;
  const botLook = { dx: lookX, dy: rise > 0 && t < sortedAt ? 0.8 : 0 };
  const botTilt = rise > 0 ? lookX * 5 * (t < sortedAt ? 1 : 1 - glide(t, sortedAt, sortedAt + 0.25)) : Math.sin(t * 7) * 1.5;

  // ---- 1 + 2: the pile bursts out, then every letter flies into the AI node ----
  const gatherStep = 0.022;
  const gatherLen = 0.42;
  let absorbed = 0;
  const pile = PILE.map(([x0, y, rot, w, stroke, dot], i) => {
    const x = 500 + (x0 - 500) * 0.93;
    const s = bounce(t, 0.03 + i * 0.032, fps);
    const g0 = p.gatherTime + i * gatherStep;
    const u = glide(t, g0, g0 + gatherLen);
    if (u >= 0.98) absorbed += 1;
    const jiggle = Math.sin(t * 9 + i * 1.7) * 5 * (1 - u);
    const px = mix(x, ai.x, u);
    const py = mix(y, ai.y, u);
    const scale = s * mix(1, 0.22, u);
    const opacity = Math.min(1, s * 4) * interpolate(u, [0.82, 1], [1, 0], clamp);
    return { i, px, py, w, stroke, dot, scale, opacity, rot: rot * (1 - u) + jiggle, u };
  });

  const pulls = pile
    .filter((l) => l.u > 0 && l.u < 1)
    .map((l) => (
      <line
        key={l.i}
        x1={l.px}
        y1={l.py}
        x2={ai.x}
        y2={ai.y}
        stroke={NJ.violet}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="4 14"
        opacity={0.85 * Math.sin(Math.PI * l.u)}
      />
    ));

  const absorbBump = 1;

  // ---- 3: three baskets, each fed down its own line ----
  const defs = [
    { label: p.keep1, count: p.count1, time: p.time1, tint: NJ.grad, Icon: EyeIcon, stroke: NJ.violet, color: p.accentColor },
    { label: p.keep2, count: p.count2, time: p.time2, tint: NJ.gradCyan, Icon: FlagIcon, stroke: NJ.cyan, color: p.accentColor },
    { label: p.skip, count: p.count3, time: p.time3, tint: GREY, Icon: TrashIcon, stroke: "#94A3B8", color: NJ.muted },
  ];
  const FLY = 3;
  const flyGap = 0.1;
  const flyLen = 0.4;

  const lines = [];
  const flyers = [];
  const baskets = defs.map((d, k) => {
    const bx = BASKET_X[k];
    const s = bounce(t, d.time, fps) * exitPop(t, dur - (2 - k) * 0.05, 0.3);
    const draw = glide(t, d.time - 0.1, d.time + 0.22);
    if (draw > 0) {
      lines.push(
        <path
          key={`l${k}`}
          d={linePath(bx, ai.y, draw)}
          stroke={k === 2 ? "#94A3B8" : NJ.violet}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={k === 2 ? "6 14" : "none"}
          fill="none"
          opacity={0.9 * Math.min(1, aiOut * 3)}
        />
      );
    }
    let landed = 0;
    let bump = 1;
    for (let j = 0; j < FLY; j++) {
      const f0 = d.time + 0.06 + j * flyGap;
      const u = glide(t, f0, f0 + flyLen);
      if (u >= 0.98) {
        landed += 1;
        bump = 1;
      }
      if (u > 0 && u < 0.98) {
        const [fx, fy] = onLine(bx, ai.y, u);
        flyers.push(
          <div
            key={`f${k}-${j}`}
            style={{
              position: "absolute",
              left: fx,
              top: fy,
              width: 0,
              height: 0,
              transform: `rotate(${(j - 1) * 14 + u * 20}deg) scale(${0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.2))})`,
            }}
          >
            <div style={{ position: "absolute", left: -41, top: -29 }}>
              <Envelope w={82} stroke={d.stroke} />
            </div>
          </div>
        );
      }
    }
    const countP = bounce(t, d.time + 0.06 + (FLY - 1) * flyGap + flyLen, fps);
    return (
      <div
        key={k}
        style={{
          position: "absolute",
          left: bx,
          top: BASKET_TOP,
          width: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: Math.min(1, s * 4),
          transform: `translateY(${(1 - Math.min(1, s)) * 30}px) scale(${s}) rotate(${k === 2 ? 4 : 0}deg)`,
          transformOrigin: "50% 40%",
        }}
      >
        <div style={{ position: "relative" }}>
          <Basket tint={d.tint} Icon={d.Icon} filled={landed} bump={bump} stroke={d.stroke} />
          <Badge scale={countP} color={k === 2 ? "#64748B" : NJ.strike} size={62}>
            {d.count}
          </Badge>
        </div>
        <LabelPill color={d.color} size={48} scale={bounce(t, d.time + 0.1, fps)}>
          {d.label}
        </LabelPill>
      </div>
    );
  });

  const sending = defs.some((d) => t > d.time && t < d.time + 0.06 + FLY * flyGap + flyLen);
  const sendPulse = 1;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width="1000" height="450" viewBox="0 0 1000 450" fill="none" style={{ position: "absolute", left: 0, top: 0 }}>
        {pulls}
        {lines}
      </svg>

      {pile.map((l) => (
        <div
          key={l.i}
          style={{
            position: "absolute",
            left: l.px,
            top: l.py,
            width: 0,
            height: 0,
            opacity: l.opacity,
            transform: `rotate(${l.rot}deg) scale(${l.scale})`,
          }}
        >
          <div style={{ position: "absolute", left: -l.w / 2, top: (-l.w * 0.7) / 2 }}>
            <Envelope w={l.w} stroke={l.stroke} dot={l.dot} />
          </div>
        </div>
      ))}

      {baskets}
      {flyers}

      <div
        style={{
          position: "absolute",
          left: ai.x,
          top: ai.y,
          width: 0,
          height: 0,
          // In the NJ bot version the bot itself stands in for this node.
          opacity: p.hideAi ? 0 : Math.min(1, aiIn * 4, aiOut * 4),
          transform: `scale(${aiIn * aiOut * absorbBump * sendPulse})`,
        }}
      >
        {withBot ? (
          <div style={{ position: "absolute", left: 0, top: 0, filter: "drop-shadow(0 12px 14px rgba(15, 23, 42, 0.35))" }}>
            <NjBot x={0} y={0} w={botW} src={p.botImage} look={botLook} mode={botMode} blink={botBlink} tilt={botTilt} />
          </div>
        ) : (
        <div style={{ position: "absolute", left: -aiSize / 2, top: -aiSize / 2 }}>
          <div style={{ position: "relative" }}>
            <IconBubble size={aiSize} tint={VIOLET_SOFT}>
              <div
                style={{
                  fontFamily: NJ.font,
                  fontWeight: 700,
                  fontSize: aiSize * 0.44,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                }}
              >
                {p.aiLabel}
              </div>
            </IconBubble>
            <div
              style={{
                position: "absolute",
                right: -aiSize * 0.12,
                top: -aiSize * 0.1,
                width: aiSize * 0.4,
                height: aiSize * 0.4,
                borderRadius: "50%",
                backgroundImage: NJ.gradCyan,
                border: "4px solid #FFFFFF",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotate(${t * 140}deg)`,
              }}
            >
              <SparkIcon size={aiSize * 0.24} color="#FFFFFF" />
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
