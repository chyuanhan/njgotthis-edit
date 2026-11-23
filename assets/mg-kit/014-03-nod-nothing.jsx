import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { NJ, clamp, prog, pop, outro, Card, CheckIcon, ArrowIcon, Face } from "./nj-kit.jsx";

const HAIR = ["#2A2850", NJ.deep, "#6366F1"];
const HEAD = 164;

// Three listeners nod along one after another (each earns a tick), then doze off
// as the punchline card lands: "没有然后了", next to a struck-out "next step" arrow.
export default function NodNothing({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;
  const out = outro(t, dur, 0.26);

  const times = [p.nod1, p.nod2, p.nod3];
  const dim = prog(t, p.dimTime, p.dimTime + 0.3);
  const asleep = t >= p.dimTime + 0.12;

  const heads = times.map((start, i) => {
    const s = pop(t, start, fps, { damping: 9, stiffness: 260, mass: 0.6 });
    const local = t - start;
    // keep nodding every half second until everyone switches off
    const nod = local > 0 && !asleep ? Math.sin(((local % 0.5) / 0.5) * Math.PI) : 0;
    const badge = pop(t, start + 0.16, fps, { damping: 8, stiffness: 260, mass: 0.5 });
    return (
      <div
        key={i}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: Math.min(1, s * 3) * (1 - 0.28 * dim),
          transform: `translateY(${(1 - s) * 30}px) scale(${(0.6 + 0.4 * s) * (1 - 0.05 * dim)})`,
        }}
      >
        <div style={{ position: "relative", width: HEAD, height: HEAD }}>
          <div
            style={{
              transformOrigin: "50% 100%",
              transform: `translateY(${nod * 18 + dim * 8}px) scaleY(${1 - nod * 0.08}) rotate(${dim * 9}deg)`,
              filter: "drop-shadow(0 14px 16px rgba(91, 84, 232, 0.3))",
            }}
          >
            <Face size={HEAD} hair={HAIR[i]} mood={asleep ? "sleep" : "happy"} />
          </div>
          <div
            style={{
              position: "absolute",
              right: -12,
              top: -6,
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: NJ.okBg,
              border: "4px solid #FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: Math.min(1, badge * 3) * (1 - dim),
              transform: `scale(${badge})`,
            }}
          >
            <CheckIcon size={34} color={NJ.ok} stroke={3.8} />
          </div>
        </div>
        <div
          style={{
            padding: "4px 20px 6px",
            borderRadius: 18,
            backgroundColor: NJ.paper,
            border: `2px solid ${NJ.line}`,
            fontFamily: NJ.fontZh,
            fontWeight: 900,
            fontSize: 36,
            color: p.inkColor,
            whiteSpace: "nowrap",
          }}
        >
          {p.chipText}
        </div>
      </div>
    );
  });

  const hP = pop(t, p.punchTime, fps, { damping: 10, stiffness: 230, mass: 0.7 });
  const shakeLocal = t - p.punchTime;
  const shake =
    shakeLocal > 0 && shakeLocal < 0.45
      ? Math.sin(shakeLocal * 60) * 9 * (1 - shakeLocal / 0.45)
      : 0;
  const strike = prog(t, p.punchTime + 0.22, p.punchTime + 0.5);
  const big = {
    fontFamily: NJ.fontZh,
    fontWeight: 900,
    fontSize: 104,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: p.inkColor,
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 14,
        gap: 18,
        opacity: out,
        transform: `translateY(${(1 - out) * -22}px)`,
      }}
    >
      <div style={{ display: "flex", gap: 64, alignItems: "flex-start" }}>{heads}</div>
      <Card
        style={{
          padding: "18px 50px 22px 28px",
          display: "flex",
          alignItems: "center",
          gap: 26,
          opacity: Math.min(1, hP * 3),
          transform: `translateX(${shake}px) scale(${interpolate(hP, [0, 1], [1.35, 1], clamp)})`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 104,
            height: 104,
            borderRadius: 30,
            backgroundColor: "#F1EFFE",
            border: "2px solid #DDD9FB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowIcon size={66} color={p.accentColor} stroke={3} />
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 46,
              width: 80 * strike,
              height: 12,
              borderRadius: 6,
              backgroundColor: NJ.strike,
              transformOrigin: "40px 6px",
              transform: "rotate(-45deg)",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <div style={big}>{p.prefix}</div>
          <div style={{ position: "relative", display: "flex" }}>
            <div style={{ ...big, color: p.accentColor }}>{p.strikeWord}</div>
            <div
              style={{
                position: "absolute",
                left: "-4%",
                top: "50%",
                height: 14,
                width: `${strike * 108}%`,
                borderRadius: 7,
                backgroundColor: NJ.strike,
                transform: "rotate(-5deg)",
              }}
            />
          </div>
          <div style={big}>{p.suffix}</div>
        </div>
      </Card>
    </div>
  );
}
