import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { NJ, prog, bounce, exitPop, IconItem, BellIcon, ClockIcon, CheckIcon } from "./nj-kit.jsx";

const GREEN = "linear-gradient(60deg, #34D399 0%, #047857 100%)";

// Icon layout: a bell in the middle rings on "提醒我", with "对的时候" on its left
// and a green "不怕忘记" tick on its right.
export default function ReminderIcons({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;

  const bellIn = bounce(t, 0.06, fps);
  const ringLocal = t - p.ringTime;
  const ring = ringLocal > 0 ? Math.sin(ringLocal * 34) * 20 * Math.max(0, 1 - ringLocal / 0.8) : 0;
  const wave = prog(t, p.ringTime, p.ringTime + 0.6);
  const wave2 = prog(t, p.ringTime + 0.18, p.ringTime + 0.78);
  const clockIn = bounce(t, p.chip1Time, fps);
  const checkIn = bounce(t, p.chip2Time, fps);

  const ringStyle = (w) => ({
    position: "absolute",
    left: -18,
    top: -18,
    right: -18,
    bottom: -18,
    borderRadius: "50%",
    border: `8px solid ${NJ.cyan}`,
    opacity: w > 0 && w < 1 ? 1 - w : 0,
    transform: `scale(${0.9 + 0.5 * w})`,
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <IconItem
        x={190}
        y={56}
        s={clockIn * exitPop(t, dur - 0.1, 0.3)}
        bob={Math.sin(t * 2.6) * 5}
        size={176}
        tint={NJ.gradCyan}
        label={p.chip1}
        labelColor={p.inkColor}
        labelSize={48}
        labelScale={bounce(t, p.chip1Time + 0.08, fps)}
      >
        <ClockIcon size={106} color="#FFFFFF" />
      </IconItem>

      <IconItem
        x={500}
        y={34}
        s={bellIn * exitPop(t, dur - 0.05, 0.3)}
        bob={Math.sin(t * 2.6 + 1.3) * 5}
        size={204}
        label={p.title}
        labelColor={p.accentColor}
        labelSize={54}
        labelScale={bounce(t, p.ringTime, fps)}
        badge={
          <React.Fragment>
            <div style={ringStyle(wave)} />
            <div style={ringStyle(wave2)} />
          </React.Fragment>
        }
      >
        <div style={{ transform: `rotate(${ring}deg)`, transformOrigin: "50% 12%" }}>
          <BellIcon size={128} color="#FFFFFF" />
        </div>
      </IconItem>

      <IconItem
        x={810}
        y={56}
        s={checkIn * exitPop(t, dur, 0.3)}
        bob={Math.sin(t * 2.6 + 2.6) * 5}
        size={176}
        tint={GREEN}
        label={p.chip2}
        labelColor={NJ.ok}
        labelSize={48}
        labelScale={bounce(t, p.chip2Time + 0.08, fps)}
      >
        <CheckIcon size={110} color="#FFFFFF" stroke={3.2} />
      </IconItem>
    </div>
  );
}
