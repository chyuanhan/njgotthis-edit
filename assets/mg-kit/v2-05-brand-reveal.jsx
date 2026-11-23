import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Img } from "remotion";
import { NJ, clamp, bounce, exitPop, ShieldIcon } from "./nj-kit.jsx";

function Sparkle({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 2 L24.5 15.5 L38 20 L24.5 24.5 L20 38 L15.5 24.5 L2 20 L15.5 15.5 Z" fill={color} />
    </svg>
  );
}

// "可是今天我有" chip, then the brand pill (real NexJarvis brandmark) lands with a shine sweep.
export default function BrandReveal({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;
  const out = exitPop(t, dur, 0.3);

  const leadP = bounce(t, 0.04, fps);
  const bP = bounce(t, p.brandTime, fps);
  const shine = interpolate(t, [p.brandTime + 0.15, p.brandTime + 0.75], [-30, 130], clamp);
  const sparks = [
    { left: 50, top: 130, size: 54, delay: 0.1, color: NJ.cyan },
    { left: 880, top: 96, size: 70, delay: 0.2, color: NJ.light },
    { left: 868, top: 300, size: 44, delay: 0.32, color: NJ.cyan },
    { left: 96, top: 306, size: 40, delay: 0.26, color: NJ.light },
  ].map((s, i) => {
    const sp = bounce(t, p.brandTime + s.delay, fps);
    const twinkle = 0.85 + 0.15 * Math.sin((t - p.brandTime) * 9 + i);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: s.left,
          top: s.top,
          opacity: Math.min(1, sp * 3),
          transform: `scale(${sp * twinkle}) rotate(${(1 - sp) * 90}deg)`,
        }}
      >
        <Sparkle size={s.size} color={s.color} />
      </div>
    );
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(1, out * 4),
        transform: `scale(${out})`,
      }}
    >
      {sparks}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 34px 10px 22px",
            borderRadius: 26,
            backgroundColor: NJ.paper,
            border: `2px solid ${NJ.line}`,
            boxShadow: NJ.cardShadow,
            fontFamily: NJ.fontZh,
            fontWeight: 900,
            fontSize: 48,
            color: p.inkColor,
            whiteSpace: "nowrap",
            opacity: Math.min(1, leadP * 3),
            transform: `translateY(${(1 - Math.min(1, leadP)) * 30}px) scale(${leadP})`,
          }}
        >
          <ShieldIcon size={52} color={NJ.violet} />
          {p.lead}
        </div>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "22px 58px 26px 28px",
            borderRadius: 46,
            backgroundImage: NJ.grad,
            boxShadow: "0 30px 60px -18px rgba(91, 84, 232, 0.85)",
            opacity: Math.min(1, bP * 3),
            transform: `scale(${0.5 + 0.5 * bP})`,
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: 112,
              height: 112,
              borderRadius: 33,
              backgroundColor: "#FFFFFF",
              flexShrink: 0,
              transform: `rotate(${(1 - bP) * -120}deg)`,
            }}
          >
            {p.logoId ? (
              <Img
                src={p.logoId}
                style={{ position: "absolute", left: -15, top: -15, width: 142, height: 142 }}
              />
            ) : null}
          </div>
          <div
            style={{
              fontFamily: NJ.font,
              fontWeight: 700,
              fontSize: 108,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {p.brand}
          </div>
          <div
            style={{
              position: "absolute",
              top: -20,
              bottom: -20,
              left: `${shine}%`,
              width: 90,
              backgroundColor: "rgba(255, 255, 255, 0.35)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
