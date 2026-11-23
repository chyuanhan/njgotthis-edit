import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { NJ, clamp, prog, pop, outro, Card, Eyebrow, MailIcon, StopwatchIcon } from "./nj-kit.jsx";

// Compact hook title card for the lean-in shot. It sits to the right of the pointing
// hand: line 1 holds with a "typing…" bubble, then line 2 slams in on "回不去了".
export default function HookTitle({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;

  const inP = pop(t, 0.06, fps);
  const out = outro(t, dur, 0.2);
  const punch = p.punchTime;
  const punchP = pop(t, punch, fps, { damping: 10, stiffness: 220, mass: 0.7 });
  const showDots = t < punch;
  const underline = prog(t, punch + 0.1, punch + 0.42);
  const badgeP = pop(t, punch + 0.2, fps, { damping: 8, stiffness: 240, mass: 0.6 });
  const badgeWobble = 0;
  const chipP = pop(t, p.chipTime, fps, { damping: 9, stiffness: 240, mass: 0.6 });

  const dots = [0, 1, 2].map((i) => {
    const wave = Math.max(0, Math.sin((t * 1.7 - i * 0.16) * Math.PI * 2));
    return (
      <div
        key={i}
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: p.accentColor,
          opacity: 0.45 + 0.55 * wave,
          transform: `translateY(${wave * -12}px)`,
        }}
      />
    );
  });

  const line1 = {
    fontFamily: NJ.fontZh,
    fontWeight: 900,
    fontSize: 62,
    lineHeight: 1.16,
    letterSpacing: "-0.02em",
    color: p.inkColor,
    whiteSpace: "nowrap",
  };
  const line2 = {
    ...line1,
    fontSize: 86,
    color: p.accentColor,
    opacity: Math.min(1, punchP * 3),
    transform: `scale(${1.5 - 0.5 * punchP}) rotate(${(1 - punchP) * -5}deg)`,
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          position: "relative",
          padding: "28px 44px 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: Math.min(1, prog(t, 0.06, 0.24)) * out,
          transform: `translateY(${(1 - inP) * 40 - (1 - out) * 22}px) scale(${0.9 + 0.1 * inP})`,
        }}
      >
        <Eyebrow text={p.eyebrow} size={20} />
        <div style={line1}>{p.line1}</div>
        <div
          style={{
            height: 108,
            minWidth: 380,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showDots ? (
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                height: 70,
                padding: "0 34px",
                borderRadius: 35,
                backgroundColor: "#F1EFFE",
                border: "2px solid #DDD9FB",
              }}
            >
              {dots}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={line2}>{p.line2}</div>
              <div
                style={{
                  height: 10,
                  width: `${underline * 100}%`,
                  borderRadius: 5,
                  backgroundImage: NJ.gradCyan,
                  alignSelf: "flex-start",
                  marginTop: -4,
                }}
              />
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            left: -34,
            top: -36,
            width: 84,
            height: 84,
            borderRadius: 26,
            backgroundImage: NJ.gradCyan,
            boxShadow: NJ.glow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: Math.min(1, badgeP * 3),
            transform: `scale(${0.4 + 0.6 * badgeP}) rotate(${interpolate(badgeP, [0, 1], [-34, -9], clamp) + badgeWobble}deg)`,
          }}
        >
          <MailIcon size={54} color="#FFFFFF" />
        </div>
        <div
          style={{
            position: "absolute",
            right: -22,
            bottom: -34,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 24px 8px 14px",
            borderRadius: 20,
            backgroundImage: NJ.grad,
            boxShadow: NJ.glow,
            color: "#FFFFFF",
            fontFamily: NJ.fontZh,
            fontWeight: 900,
            fontSize: 36,
            whiteSpace: "nowrap",
            opacity: Math.min(1, chipP * 3),
            transform: `scale(${0.4 + 0.6 * chipP}) rotate(${interpolate(chipP, [0, 1], [14, 4], clamp)}deg)`,
          }}
        >
          <StopwatchIcon size={40} color="#FFFFFF" />
          {p.chip}
        </div>
      </Card>
    </div>
  );
}
