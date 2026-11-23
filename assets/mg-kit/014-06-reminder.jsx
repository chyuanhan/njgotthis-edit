import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { NJ, clamp, prog, pop, outro, Card, IconTile, BellIcon, CalendarIcon, WarningIcon } from "./nj-kit.jsx";

// Jarvis rewinds through past meetings: a 3D deck of meeting-note sheets flips back in
// time (上次 → 上上次 → 上上上次), then every sheet is pulled back into a list and
// stamped "未解决" one by one.

const BODY_H = 292;
const DECK_H = 200;
const DECK_TOP = BODY_H - DECK_H - 6;
const ROW_H = 80;
const ROW_GAP = 12;

function lerp(a, b, k) {
  return a + (b - a) * k;
}

function RewindIcon({ size, color, angle }) {
  const s = size || 28;
  const c = color || "#FFFFFF";
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${angle || 0}deg)` }}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M4 3.8v4.4h4.4" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.2V12l2.6 1.6" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Reminder({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;
  const out = outro(t, dur, 0.28);
  const inP = pop(t, 0.04, fps);

  const labels = [p.row1, p.row2, p.row3];
  const times = [p.time1, p.time2, p.time3];
  const flipCfg = { damping: 15, stiffness: 170, mass: 0.7 };

  // Focus index: 0 = 上次, 1 = 上上次, 2 = 上上上次. Each spoken label flips one sheet back.
  const focusAt = (time) => pop(time, times[1], fps, flipCfg) + pop(time, times[2], fps, flipCfg);
  const focus = focusAt(t);
  const speed = Math.min(1, Math.abs(focus - focusAt(t - 1 / fps)) * 6);

  // Deck drops in, then fans out into a list for "还有什么东西是没有解决的".
  const deckIn = pop(t, p.time1 - 0.3, fps, { damping: 13, stiffness: 200, mass: 0.7 });
  const fan = pop(t, p.fanTime, fps, { damping: 15, stiffness: 180, mass: 0.75 });
  const fanned = fan > 0.02;

  const ring = Math.max(0, 1 - Math.abs(t - p.bellTime) / 0.6);
  const bellAngle = t > p.bellTime - 0.05 ? Math.sin((t - p.bellTime) * 30) * 16 * ring : 0;
  const rewindAngle = -t * 220 * (0.35 + speed * 2.2);

  const listTop0 = (BODY_H - (3 * ROW_H + 2 * ROW_GAP)) / 2;

  const sheets = labels.map((label, i) => {
    const d = i - focus; // >0: older, waiting behind; <0: newer, flown toward viewer
    let dTop;
    let dScale;
    let dOpacity;
    if (d >= 0) {
      dTop = DECK_TOP - d * 40;
      dScale = 1 - d * 0.07;
      dOpacity = Math.max(0, 1 - d * 0.22);
    } else {
      // Newer sheet lifts off up and toward the viewer, fading fast.
      const a = Math.min(1, -d);
      dTop = DECK_TOP - a * 170;
      dScale = 1 + a * 0.12;
      dOpacity = Math.max(0, 1 - a * 2.4);
    }
    // Deck entrance: sheets drop from above, back sheets first.
    const enter = Math.min(1, Math.max(0, deckIn * 1.15 - (2 - i) * 0.08));
    dTop -= (1 - enter) * 120;
    dOpacity *= Math.min(1, enter * 1.4);

    const lTop = listTop0 + i * (ROW_H + ROW_GAP);
    const k = Math.min(1, Math.max(0, fan));
    const top = lerp(dTop, lTop, k);
    const height = lerp(DECK_H, ROW_H, k);
    const scale = lerp(dScale, 1, k);
    const opacity = lerp(dOpacity, 1, k);
    const front = Math.abs(d) < 0.5 && !fanned;
    const notesOpacity = Math.max(0, 1 - k * 2.5) * Math.max(0, Math.min(1, 1 - (d - 0.2) * 2.5));
    // Back sheets show only their edge in the deck; their label returns in the list.
    const labelOpacity = lerp(Math.max(0, Math.min(1, 1 - (d - 0.2) * 2.5)), 1, k);

    const stampStart = p.flagTime + i * p.flagStep;
    const st = pop(t, stampStart, fps, { damping: 9, stiffness: 300, mass: 0.6 });
    const stamped = t >= stampStart;
    const slam = interpolate(st, [0, 1], [1.9, 1], clamp);
    const pulse = stamped ? 1 + 0.035 * Math.sin((t - stampStart) * 9) : 1;
    const flash = stamped ? Math.max(0, 1 - (t - stampStart) / 0.35) : 0;

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top,
          height,
          zIndex: 10 - i,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "50% 0%",
          borderRadius: lerp(28, 22, k),
          backgroundColor: front ? "#FFFFFF" : "#F6F4FF",
          border: `2px solid ${front ? "#CFC9FA" : "#E4E0FC"}`,
          boxShadow: front
            ? "0 22px 40px -22px rgba(91, 84, 232, 0.55)"
            : `0 10px 24px -18px rgba(91, 84, 232, ${0.45 * (1 - k)})`,
          overflow: "hidden",
          padding: `${lerp(20, 13, k)}px 18px 0 18px`,
          boxSizing: "border-box",
        }}
      >
        {flash > 0 ? (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#EEF0FF", opacity: flash * 0.9 }} />
        ) : null}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, height: 50, opacity: labelOpacity }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 15,
              backgroundColor: NJ.violet,
              backgroundImage: NJ.grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarIcon size={32} color="#FFFFFF" />
          </div>
          <div
            style={{
              flex: 1,
              fontFamily: NJ.fontZh,
              fontWeight: 900,
              fontSize: 44,
              color: p.inkColor,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
          {stamped ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 24px 10px 16px",
                borderRadius: 999,
                backgroundImage: NJ.grad,
                boxShadow: NJ.glow,
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 34,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
                opacity: Math.min(1, st * 3),
                transform: `scale(${slam * pulse}) rotate(${(1 - st) * -14}deg)`,
              }}
            >
              <WarningIcon size={32} color="#FFFFFF" />
              {p.flag}
            </div>
          ) : (
            <div
              style={{
                fontFamily: NJ.font,
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: NJ.eyebrow,
                whiteSpace: "nowrap",
                opacity: notesOpacity,
              }}
            >
              {p.sheetTag}
            </div>
          )}
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 11,
            opacity: notesOpacity,
          }}
        >
          {[0, 1, 2].map((r) => {
            const isTodo = r === 1;
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    flexShrink: 0,
                    border: `3px solid ${isTodo ? NJ.violet : "#D9D6F3"}`,
                    backgroundColor: isTodo ? "#EEEAFE" : "transparent",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    height: 16,
                    borderRadius: 8,
                    width: [430, 360, 300][(r + i) % 3],
                    backgroundColor: isTodo ? "#C9C3F8" : "#E6E4F3",
                  }}
                />
                {isTodo ? (
                  <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: NJ.violet, opacity: 0.85 }} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  const pillSwap = prog(t, p.flagTime + 2 * p.flagStep, p.flagTime + 2 * p.flagStep + 0.2);
  const badgeP = pop(t, p.flagTime + 2 * p.flagStep, fps, { damping: 8, stiffness: 260, mass: 0.5 });
  const showCount = t >= p.flagTime + 2 * p.flagStep;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(1, prog(t, 0.04, 0.24)) * out,
        transform: `translateY(${(1 - inP) * 50 - (1 - out) * 24}px) scale(${0.92 + 0.08 * inP})`,
      }}
    >
      <Card style={{ width: 860, padding: "22px 26px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ transform: `rotate(${bellAngle}deg)`, transformOrigin: "50% 15%" }}>
            <IconTile size={64} radius={20}>
              <BellIcon size={36} />
            </IconTile>
          </div>
          <div
            style={{
              flex: 1,
              fontFamily: NJ.fontZh,
              fontWeight: 900,
              fontSize: 46,
              color: p.inkColor,
              whiteSpace: "nowrap",
            }}
          >
            {p.title}
          </div>
          {showCount ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 20px 8px 8px",
                borderRadius: 999,
                backgroundColor: "#FEECEC",
                transform: `scale(${badgeP})`,
                opacity: Math.min(1, badgeP * 3),
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: NJ.strike,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: NJ.font,
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#FFFFFF",
                }}
              >
                {p.count}
              </div>
              <div style={{ fontFamily: NJ.fontZh, fontWeight: 900, fontSize: 28, color: NJ.strike, whiteSpace: "nowrap" }}>
                {p.countText}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px 10px 14px",
                borderRadius: 999,
                backgroundImage: NJ.gradCyan,
                boxShadow: "0 12px 26px -12px rgba(79, 70, 229, 0.9)",
                opacity: Math.min(1, deckIn * 2) * (1 - pillSwap),
                transform: `scale(${0.8 + 0.2 * deckIn + speed * 0.06})`,
              }}
            >
              <RewindIcon size={30} angle={rewindAngle} />
              <div style={{ fontFamily: NJ.fontZh, fontWeight: 900, fontSize: 28, color: "#FFFFFF", whiteSpace: "nowrap" }}>
                {p.rewindText}
              </div>
            </div>
          )}
        </div>
        <div style={{ height: 2, backgroundColor: NJ.line }} />
        <div style={{ position: "relative", height: BODY_H, overflow: "hidden", borderRadius: 24 }}>
          {sheets}
        </div>
      </Card>
    </div>
  );
}
