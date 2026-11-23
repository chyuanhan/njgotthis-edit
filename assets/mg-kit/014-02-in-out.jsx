import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { NJ, pop, outro, Face, Ear, ArrowIcon } from "./nj-kit.jsx";

const CX = 500;
const CY = 172;
const HEAD = 256;
const EAR = 146;
const SPEED = 0.95; // bubbles per second, per lane
const BUBBLE_W = 98;
const IN_FROM = 24;
const IN_TO = CX - HEAD / 2 - 92;
const OUT_FROM = CX + HEAD / 2 + 8;
const OUT_TO = 880;

// A speech bubble: solid while it is still "content", dashed and hollow once it has leaked out.
function Bubble({ ghost }) {
  const fill = ghost ? "#EDE9FE" : NJ.violet;
  const edge = ghost ? NJ.violet : "#FFFFFF";
  const dot = ghost ? NJ.violet : "#FFFFFF";
  return (
    <svg width={BUBBLE_W} height={(BUBBLE_W * 60) / 72} viewBox="0 0 72 60" fill="none">
      <path
        d="M12 4h48a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H30L16 56V44h-4a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8z"
        fill={fill}
        stroke={edge}
        strokeWidth="4"
        strokeLinejoin="round"
        strokeDasharray={ghost ? "7 6" : "none"}
      />
      <circle cx="22" cy="24" r="4.5" fill={dot} />
      <circle cx="36" cy="24" r="4.5" fill={dot} />
      <circle cx="50" cy="24" r="4.5" fill={dot} />
    </svg>
  );
}

// "左边进 → 右边出": what is said goes in one ear of a blank-faced listener and straight out the other.
export default function InOut({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;
  const out = outro(t, dur, 0.26);

  const headP = pop(t, 0.04, fps);
  const inP = pop(t, p.inTime, fps);
  const outP = pop(t, p.outTime, fps, { damping: 10, stiffness: 230, mass: 0.7 });
  const inLocal = t - p.inTime;
  const outLocal = t - p.outTime;

  const lane = [0, 1, 2];
  const incoming = lane.map((i) => {
    const u = inLocal * SPEED - i / 3;
    if (u < 0) return null;
    const ph = u % 1;
    const x = IN_FROM + (IN_TO - IN_FROM) * ph;
    const y = CY - 30 - Math.sin(ph * Math.PI) * 26;
    const fade = Math.min(1, ph * 5) * (ph > 0.84 ? (1 - ph) / 0.16 : 1);
    return (
      <div
        key={`in-${i}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: fade,
          transform: `scale(${1 - 0.5 * ph * ph})`,
        }}
      >
        <Bubble />
      </div>
    );
  });

  const outgoing = lane.map((i) => {
    const u = outLocal * SPEED - i / 3;
    if (u < 0) return null;
    const ph = u % 1;
    const x = OUT_FROM + (OUT_TO - OUT_FROM) * ph;
    const y = CY - 30 + ph * ph * 70;
    const fade = Math.min(1, ph * 6) * (1 - ph * ph);
    return (
      <div
        key={`out-${i}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: fade,
          transform: `scale(${0.5 + 0.5 * Math.min(1, ph * 3)}) rotate(${ph * 34}deg)`,
        }}
      >
        <Bubble ghost />
      </div>
    );
  });

  const earInPulse = inLocal > 0 ? 1 + 0.07 * Math.abs(Math.sin(inLocal * SPEED * 3 * Math.PI)) : 1;
  const earOutPulse = outLocal > 0 ? 1 + 0.07 * Math.abs(Math.sin(outLocal * SPEED * 3 * Math.PI)) : 1;
  const look = inLocal > 0 ? Math.sin(inLocal * 3.2) : 0;
  const bob = Math.sin(t * 3) * 2;

  const chip = {
    position: "absolute",
    top: 324,
    height: 100,
    padding: "0 32px",
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    gap: 14,
    fontFamily: NJ.fontZh,
    fontWeight: 900,
    fontSize: 58,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: out,
        transform: `translateY(${(1 - out) * -22}px)`,
      }}
    >
      {incoming}
      {outgoing}

      <div
        style={{
          position: "absolute",
          left: CX - HEAD / 2,
          top: CY - HEAD / 2,
          width: HEAD,
          height: HEAD,
          opacity: Math.min(1, headP * 3),
          transform: `scale(${0.6 + 0.4 * headP}) rotate(${bob}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -72,
            top: (HEAD - EAR) / 2 + 14,
            transformOrigin: "100% 50%",
            transform: `scale(${earInPulse})`,
          }}
        >
          <Ear size={EAR} />
        </div>
        <div
          style={{
            position: "absolute",
            right: -72,
            top: (HEAD - EAR) / 2 + 14,
            transformOrigin: "0% 50%",
            transform: `scale(${earOutPulse})`,
          }}
        >
          <Ear size={EAR} flip />
        </div>
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 22px rgba(91, 84, 232, 0.35))" }}>
          <Face size={HEAD} mood="blank" look={look} />
        </div>
      </div>

      <div
        style={{
          ...chip,
          left: 24,
          backgroundColor: NJ.paper,
          border: `2px solid ${NJ.line}`,
          boxShadow: NJ.cardShadow,
          color: p.inkColor,
          opacity: Math.min(1, inP * 3),
          transform: `translateY(${(1 - inP) * 26}px) scale(${0.7 + 0.3 * inP})`,
        }}
      >
        <ArrowIcon size={40} color={NJ.violet} stroke={3.4} />
        {p.inText}
      </div>
      <div
        style={{
          ...chip,
          right: 24,
          backgroundImage: NJ.grad,
          boxShadow: NJ.glow,
          color: "#FFFFFF",
          opacity: Math.min(1, outP * 3),
          transform: `translateY(${(1 - outP) * 26}px) scale(${0.6 + 0.4 * outP})`,
        }}
      >
        {p.outText}
        <ArrowIcon size={40} color="#FFFFFF" stroke={3.4} />
      </div>
    </div>
  );
}
