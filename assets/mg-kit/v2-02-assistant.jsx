import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { NJ, bounce, exitPop, glide, IconItem, LabelPill, SparkIcon, UserIcon, NjBot, botHeight } from "./nj-kit.jsx";

// Icon layout: the "小助理" appears at the centre with a "?" badge,
// then slides aside so a second icon can ask "你也一样？".
// With a bot image the "小助理" is the NJ bot itself instead of the spark icon.
export default function AssistantIcons({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;

  const aIn = bounce(t, 0.06, fps);
  const aLabel = bounce(t, p.keyTime, fps);
  const qP = bounce(t, p.qTime, fps);
  const qWobble = 0;
  const slide = glide(t, p.askTime - 0.08, p.askTime + 0.34);
  const bIn = bounce(t, p.askTime, fps);
  const bLabel = bounce(t, p.askTime + 0.14, fps);

  const aOut = exitPop(t, dur - 0.06, 0.3);
  const bOut = exitPop(t, dur, 0.3);

  const badgeStyle = {
    position: "absolute",
    right: -34,
    top: -22,
    width: 78,
    height: 78,
    borderRadius: 39,
    boxSizing: "border-box",
    backgroundImage: NJ.gradCyan,
    border: "5px solid #FFFFFF",
    boxShadow: NJ.glow,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: NJ.font,
    fontWeight: 700,
    fontSize: 54,
    lineHeight: 1,
    color: "#FFFFFF",
    opacity: Math.min(1, qP * 4),
    transform: `scale(${qP}) rotate(${12 + qWobble}deg)`,
  };

  // ---- NJ bot as the "小助理" ----
  const botW = 192;
  const botH = botHeight(botW);
  const aS = aIn * aOut;
  const asking = glide(t, p.qTime, p.qTime + 0.3);
  const turned = glide(t, p.askTime - 0.08, p.askTime + 0.3);
  // Happy while it is introduced, wide-eyed on the "?", then looks over at the second icon.
  const mode = t < p.qTime ? (t > p.keyTime - 0.1 ? "happy" : "normal") : t < p.askTime ? "wide" : "normal";
  const bt = (t + 0.5) % 2.3;
  const blink = bt < 0.14 ? Math.sin((Math.PI * bt) / 0.14) : 0;
  const tilt = 7 * asking * (1 - turned) + 4 * turned + Math.sin(t * 2.2) * 1.5;
  const look = { dx: turned, dy: 0 };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {p.botImage ? (
        <div
          style={{
            position: "absolute",
            left: 500 - 190 * slide,
            top: 30,
            width: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: Math.min(1, aS * 4),
            transform: `translateY(${(1 - Math.min(1, aS)) * 30 + Math.sin(t * 2.6) * 5}px) scale(${aS})`,
            transformOrigin: "50% 45%",
          }}
        >
          <div
            style={{
              position: "relative",
              width: botW,
              height: botH,
              flexShrink: 0,
              filter: "drop-shadow(0 14px 16px rgba(15, 23, 42, 0.35))",
            }}
          >
            <NjBot x={botW / 2} y={botH / 2} w={botW} src={p.botImage} look={look} mode={mode} blink={blink} tilt={tilt} />
            <div style={{ ...badgeStyle, right: -30, top: -26 }}>?</div>
          </div>
          <LabelPill color={p.accentColor} size={56} scale={aLabel}>
            {p.keyword}
          </LabelPill>
        </div>
      ) : (
        <IconItem
          x={500 - 190 * slide}
          y={40}
          s={aS}
          bob={Math.sin(t * 2.6) * 5}
          size={196}
          label={p.keyword}
          labelColor={p.accentColor}
          labelSize={56}
          labelScale={aLabel}
          badge={<div style={badgeStyle}>?</div>}
        >
          <div style={{ transform: `rotate(${Math.sin(t * 3) * 8}deg)` }}>
            <SparkIcon size={120} color="#FFFFFF" />
          </div>
        </IconItem>
      )}

      <IconItem
        x={690}
        y={50}
        s={bIn * bOut}
        bob={Math.sin(t * 2.6 + 1.4) * 5}
        size={176}
        tint={NJ.gradCyan}
        label={p.ask}
        labelColor={p.inkColor}
        labelSize={48}
        labelScale={bLabel}
      >
        <UserIcon size={106} color="#FFFFFF" />
      </IconItem>
    </div>
  );
}
