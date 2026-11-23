import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { NJ, clamp, prog, pop, outro, ArrowIcon, CheckIcon, DocIcon, CursorIcon, SparkIcon } from "./nj-kit.jsx";

// Sparks thrown off the button when it is clicked: [x from centre, y from centre, size, colour]
const BURST = [
  [-430, -86, 54, NJ.cyan],
  [-300, 96, 38, NJ.light],
  [20, -116, 44, NJ.light],
  [330, 92, 50, NJ.cyan],
  [440, -70, 40, NJ.light],
];

// Primary button (with a document glyph) → cursor clicks → sparks and "搞定",
// then a stopwatch chip fills: under one minute.
export default function OneClick({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;
  const out = outro(t, dur, 0.28);

  const btnP = pop(t, p.buttonTime, fps);
  const click = p.clickTime;
  const pressLocal = t - click;
  const press =
    pressLocal > 0 && pressLocal < 0.22 ? Math.sin((pressLocal / 0.22) * Math.PI) * 0.08 : 0;
  const clicked = t >= click + 0.1;
  const doneP = pop(t, click + 0.1, fps, { damping: 9, stiffness: 240, mass: 0.6 });
  const ripple = prog(t, click, click + 0.55);
  const burst = prog(t, click + 0.08, click + 0.8);
  const sparks = BURST.map(([x, y, size, color], i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: x * (0.72 + 0.28 * burst) - size / 2,
        marginTop: y * (0.72 + 0.28 * burst) - size / 2,
        opacity: burst > 0 && burst < 1 ? Math.sin(burst * Math.PI) : 0,
        transform: `scale(${0.4 + 0.8 * Math.sin(burst * Math.PI)}) rotate(${burst * 90 + i * 20}deg)`,
      }}
    >
      <SparkIcon size={size} color={color} />
    </div>
  ));

  const cur = interpolate(t, [click - 0.6, click], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const curOut = prog(t, click + 0.45, click + 0.75);
  const curX = 640 + (1 - cur) * 260 + curOut * 160;
  const curY = 190 + (1 - cur) * 200 + curOut * 120;
  const curOpacity = Math.min(1, prog(t, click - 0.6, click - 0.4)) * (1 - curOut);

  const timerP = pop(t, p.timerTime, fps, { damping: 10, stiffness: 230, mass: 0.65 });
  const fill = prog(t, p.timerTime + 0.1, p.timerTime + 1.1);
  const R = 30;
  const C = 2 * Math.PI * R;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: out,
        transform: `translateY(${(1 - out) * -22}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 70,
          gap: 34,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: -30,
              right: -30,
              top: -30,
              bottom: -30,
              borderRadius: 70,
              border: `8px solid ${NJ.cyan}`,
              opacity: ripple > 0 && ripple < 1 ? 1 - ripple : 0,
              transform: `scale(${0.85 + 0.3 * ripple})`,
            }}
          />
          {sparks}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "30px 44px 34px 40px",
              borderRadius: 40,
              backgroundImage: NJ.grad,
              boxShadow: "0 30px 60px -18px rgba(91, 84, 232, 0.9)",
              opacity: Math.min(1, btnP * 3),
              transform: `scale(${(0.6 + 0.4 * btnP) * (1 - press)})`,
            }}
          >
            <DocIcon size={66} color="#FFFFFF" />
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 66,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "#FFFFFF",
                whiteSpace: "nowrap",
              }}
            >
              {clicked ? p.doneLabel : p.buttonLabel}
            </div>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${clicked ? 0.6 + 0.4 * doneP : 1})`,
              }}
            >
              {clicked ? (
                <CheckIcon size={46} color={NJ.deep} stroke={4} />
              ) : (
                <ArrowIcon size={42} color={NJ.deep} stroke={3.4} />
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "14px 36px 14px 18px",
            borderRadius: 999,
            backgroundColor: NJ.paper,
            border: `2px solid ${NJ.line}`,
            boxShadow: NJ.cardShadow,
            opacity: Math.min(1, timerP * 3),
            transform: `translateY(${(1 - timerP) * 30}px) scale(${0.7 + 0.3 * timerP})`,
          }}
        >
          <svg width="76" height="90" viewBox="0 0 76 90" fill="none">
            <rect x="29" y="1" width="18" height="9" rx="4" fill={NJ.violet} />
            <rect x="34.5" y="8" width="7" height="8" fill={NJ.violet} />
            <circle cx="38" cy="52" r={R} stroke="#E2E4F3" strokeWidth="10" />
            <circle
              cx="38"
              cy="52"
              r={R}
              stroke={NJ.violet}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={C * (1 - fill)}
              transform="rotate(-90 38 52)"
            />
            <path
              d="M38 52V38"
              stroke={NJ.ink}
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${fill * 330} 38 52)`}
            />
            <circle cx="38" cy="52" r="5" fill={NJ.ink} />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 56,
                color: p.inkColor,
                whiteSpace: "nowrap",
              }}
            >
              {p.timerLead}
            </div>
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 72,
                color: p.accentColor,
                whiteSpace: "nowrap",
              }}
            >
              {p.timerValue}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: curX,
          top: curY,
          opacity: curOpacity,
          transform: `scale(${1 - press * 1.5})`,
        }}
      >
        <CursorIcon />
      </div>
    </div>
  );
}
