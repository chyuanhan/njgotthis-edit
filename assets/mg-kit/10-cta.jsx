import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { NJ, clamp, prog, pop, Eyebrow, StopwatchIcon, CheckIcon, CursorIcon } from "./nj-kit.jsx";

const TAP_DELAY = 1.5; // seconds after the button appears before the cursor taps it

// Full-frame CTA: follow button + teaser chip ride at the top while he speaks,
// then glide to the centre and grow once he steps out of frame. It holds to the
// last frame (no fade-out) so the video ends on the complete end card.
export default function Cta({ item }) {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const p = item.props;

  const btnP = pop(t, p.followTime, fps);
  const teaseP = pop(t, p.teaseTime, fps, { damping: 11, stiffness: 220, mass: 0.65 });
  const qP = pop(t, p.questionTime, fps, { damping: 8, stiffness: 250, mass: 0.55 });

  const move = interpolate(t, [p.centerTime, p.centerTime + 0.55], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const groupY = interpolate(move, [0, 1], [p.topY, height * 0.46], clamp);
  const groupScale = 1 + 0.1 * move;
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, t - p.followTime) * 7);
  const eyebrowP = prog(t, p.centerTime + 0.3, p.centerTime + 0.6);

  // A cursor comes in, taps the "+" and it turns into a tick: followed.
  const tap = p.followTime + TAP_DELAY;
  const cur = interpolate(t, [tap - 0.55, tap], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const curOut = prog(t, tap + 0.4, tap + 0.7);
  const curOpacity = Math.min(1, prog(t, tap - 0.55, tap - 0.35)) * (1 - curOut);
  const pressLocal = t - tap;
  const press = pressLocal > 0 && pressLocal < 0.22 ? Math.sin((pressLocal / 0.22) * Math.PI) * 0.07 : 0;
  const followed = t >= tap + 0.1;
  const tickP = pop(t, tap + 0.1, fps, { damping: 8, stiffness: 260, mass: 0.5 });
  const ring = prog(t, tap, tap + 0.5);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          // Centred on the frame centre (540) by default. The IG Reels safe area is x 60–960,
          // so content centred on 540 has to stay within 840 px of width.
          left: (p.centerX || 540) - 450,
          right: 1080 - (p.centerX || 540) - 450,
          top: groupY,
          height: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            transform: `scale(${groupScale})`,
          }}
        >
          <div
            style={{
              padding: "10px 26px",
              borderRadius: 18,
              backgroundColor: NJ.paper,
              border: `2px solid ${NJ.line}`,
              boxShadow: NJ.cardShadow,
              opacity: eyebrowP,
              transform: `translateY(${(1 - eyebrowP) * 16}px)`,
            }}
          >
            <Eyebrow text={p.eyebrow} size={28} />
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "24px 54px 28px 30px",
              borderRadius: 999,
              backgroundImage: NJ.grad,
              boxShadow: "0 30px 60px -18px rgba(91, 84, 232, 0.9)",
              opacity: Math.min(1, btnP * 3),
              transform: `scale(${(0.5 + 0.5 * btnP) * pulse * (1 - press)})`,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                backgroundColor: "#FFFFFF",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -14,
                  top: -14,
                  right: -14,
                  bottom: -14,
                  borderRadius: "50%",
                  border: "6px solid #FFFFFF",
                  opacity: ring > 0 && ring < 1 ? 1 - ring : 0,
                  transform: `scale(${0.9 + 0.5 * ring})`,
                }}
              />
              {followed ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${tickP})`,
                  }}
                >
                  <CheckIcon size={58} color={NJ.deep} stroke={4} />
                </div>
              ) : (
                <div>
                  <div style={{ position: "absolute", left: 20, top: 37, width: 44, height: 10, borderRadius: 5, backgroundColor: NJ.deep }} />
                  <div style={{ position: "absolute", left: 37, top: 20, width: 10, height: 44, borderRadius: 5, backgroundColor: NJ.deep }} />
                </div>
              )}
            </div>
            <div
              style={{
                position: "absolute",
                left: 56 + (1 - cur) * 250 + curOut * 120,
                top: 58 - (1 - cur) * 170 + curOut * 90,
                opacity: p.hideCursor ? 0 : curOpacity,
                transform: `scale(${1 - press * 1.5})`,
              }}
            >
              <CursorIcon size={78} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <div
                style={{
                  fontFamily: NJ.fontZh,
                  fontWeight: 900,
                  fontSize: 78,
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                {p.followLabel}
              </div>
              <div
                style={{
                  fontFamily: NJ.font,
                  fontWeight: 700,
                  fontSize: 78,
                  lineHeight: 1.1,
                  letterSpacing: "-0.035em",
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                {p.brand}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 36px 14px 16px",
              borderRadius: 30,
              backgroundColor: NJ.paper,
              border: `2px solid ${NJ.line}`,
              boxShadow: NJ.cardShadow,
              opacity: Math.min(1, teaseP * 3),
              transform: `translateY(${(1 - teaseP) * 30}px) scale(${0.8 + 0.2 * teaseP})`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundImage: NJ.grad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <StopwatchIcon size={44} color="#FFFFFF" />
            </div>
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 54,
                color: p.inkColor,
                whiteSpace: "nowrap",
              }}
            >
              {p.teaseLead}
            </div>
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 54,
                color: p.accentColor,
                whiteSpace: "nowrap",
              }}
            >
              {p.teaseKey}
            </div>
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 54,
                color: p.inkColor,
                whiteSpace: "nowrap",
                opacity: Math.min(1, qP * 3),
                transform: `scale(${0.4 + 0.6 * qP}) rotate(${(1 - qP) * 20}deg)`,
              }}
            >
              {p.teaseTail}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
