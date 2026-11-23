import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

// End-card background: the nexjarvis.io dark band gradient with a soft violet
// glow behind the follow button. Sits under the CTA once the footage ends.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

export default function EndBackground({ item }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = item.props;
  const bloom = interpolate(t, [0, 0.6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(120deg, ${p.colorStart} 0%, ${p.colorMid} 52%, ${p.colorEnd} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${p.glowY}%`,
          width: 1500,
          height: 1500,
          marginLeft: -750,
          marginTop: -750,
          borderRadius: "50%",
          backgroundImage: `radial-gradient(closest-side, ${p.glowColor} 0%, transparent 100%)`,
          opacity: 0.2 + 0.35 * bloom,
          transform: `scale(${0.8 + 0.2 * bloom})`,
        }}
      />
    </div>
  );
}
