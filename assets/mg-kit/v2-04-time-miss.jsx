import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { NJ, bounce, exitPop, glide, prog, IconItem, Badge, MailIcon, CloseIcon } from "./nj-kit.jsx";

const RED = "linear-gradient(60deg, #F87171 0%, #DC2626 100%)";
const GREY = "linear-gradient(60deg, #94A3B8 0%, #64748B 100%)";

// Icon layout: a stopwatch fills to "每天 30 分钟", then slides aside for a mail icon
// that turns red and gets an ✕ badge on "miss".
export default function TimeMissIcons({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;

  const aIn = bounce(t, p.timerTime, fps);
  const aLabel = bounce(t, p.timerTime + 0.1, fps);
  const fill = prog(t, p.timerTime + 0.1, p.timerTime + 1.3);
  const slide = glide(t, p.rowTime - 0.08, p.rowTime + 0.34);
  const bIn = bounce(t, p.rowTime, fps);
  const bLabel = bounce(t, p.rowTime + 0.12, fps);
  const missed = t >= p.missTime;
  const missP = bounce(t, p.missTime, fps);
  const shake = missed ? Math.sin((t - p.missTime) * 44) * 9 * Math.max(0, 1 - (t - p.missTime) / 0.4) : 0;

  const aOut = exitPop(t, dur - 0.06, 0.3);
  const bOut = exitPop(t, dur, 0.3);
  const R = 36;
  const C = 2 * Math.PI * R;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <IconItem
        x={500 - 190 * slide}
        y={40}
        s={aIn * aOut}
        bob={Math.sin(t * 2.6) * 5}
        size={196}
        labelSize={50}
        labelScale={aLabel}
        label={
          <React.Fragment>
            <span style={{ color: p.inkColor }}>{p.lead}</span>
            <span style={{ color: p.accentColor, fontSize: 60 }}>{p.value}</span>
          </React.Fragment>
        }
      >
        <svg width="134" height="134" viewBox="0 0 100 100" fill="none">
          <rect x="41" y="2" width="18" height="9" rx="4" fill="#FFFFFF" />
          <rect x="46.5" y="9" width="7" height="8" fill="#FFFFFF" />
          <circle cx="50" cy="56" r={R} stroke="rgba(255,255,255,0.35)" strokeWidth="9" />
          <circle
            cx="50"
            cy="56"
            r={R}
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={C * (1 - fill * 0.5)}
            transform="rotate(-90 50 56)"
          />
          <path d="M50 56V36" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" transform={`rotate(${fill * 180} 50 56)`} />
          <circle cx="50" cy="56" r="6" fill="#FFFFFF" />
        </svg>
      </IconItem>

      <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
        <IconItem
          x={690}
          y={50}
          s={bIn * bOut}
          bob={Math.sin(t * 2.6 + 1.4) * 5}
          tilt={missed ? -7 * Math.min(1, missP) : 0}
          size={176}
          tint={missed ? RED : GREY}
          label={missed ? p.stamp : p.rowText}
          labelColor={missed ? NJ.strike : p.inkColor}
          labelSize={48}
          labelScale={bLabel}
          badge={
            <Badge scale={missP} size={66}>
              <CloseIcon size={36} color="#FFFFFF" stroke={3.6} />
            </Badge>
          }
        >
          <MailIcon size={106} color="#FFFFFF" />
        </IconItem>
      </div>
    </div>
  );
}
