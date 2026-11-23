import React from "react";
import { interpolate, spring, Easing, Img } from "remotion";

// NexJarvis UI tokens, read from https://nexjarvis.io
export const NJ = {
  violet: "#5B54E8",
  deep: "#4D46D2",
  light: "#7A72EA",
  hi: "#4F46E5",
  eyebrow: "#6366F1",
  cyan: "#14C6FD",
  ink: "#0F172A",
  body: "#1E293B",
  muted: "#64748B",
  line: "#E2E8F0",
  mist: "#F4F5FB",
  paper: "#FFFFFF",
  chipBg: "#E8E7F3",
  chipInk: "#2A2850",
  okBg: "#D1FAE5",
  ok: "#047857",
  strike: "#EF4444",
  grad: "linear-gradient(60deg, #7A72EA 0%, #4D46D2 100%)",
  gradCyan: "linear-gradient(90deg, #6366F1 0%, #22D3EE 100%)",
  mistGrad: "linear-gradient(160deg, #F1EDFE 0%, #EAF8FE 100%)",
  font: '"Instrument Sans", "Noto Sans SC", sans-serif',
  fontZh: '"Noto Sans SC", "Instrument Sans", sans-serif',
  cardShadow:
    "0 34px 70px -30px rgba(91, 84, 232, 0.6), 0 6px 18px rgba(15, 23, 42, 0.10)",
  glow: "0 18px 40px -14px rgba(91, 84, 232, 0.75)",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// 0→1 eased progress between two times (seconds)
export function prog(time, start, end) {
  return interpolate(time, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
}

// 0→1 entrance that starts at `start` seconds. No bounce: a plain cubic ease-out
// with no overshoot (the user asked to drop the bounce on 2026-11-20). `fps` and
// `config` are kept so existing callers do not need to change.
export function pop(time, start, fps, config) {
  return interpolate(time, [start, start + 0.3], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
}

// 1→0 over the last `len` seconds of the graphic
export function outro(time, durationSeconds, len) {
  const l = len || 0.28;
  return interpolate(time, [durationSeconds - l, durationSeconds], [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
}

export function Card({ children, style }) {
  return (
    <div
      style={{
        backgroundColor: NJ.paper,
        borderRadius: 40,
        border: `2px solid ${NJ.line}`,
        boxShadow: NJ.cardShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ text, color, size, lines }) {
  const c = color || NJ.eyebrow;
  const s = size || 24;
  const bar = { width: 44, height: 3, borderRadius: 2, backgroundColor: c, opacity: 0.55 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {lines ? <div style={bar} /> : null}
      <div
        style={{
          fontFamily: NJ.font,
          fontWeight: 700,
          fontSize: s,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: c,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      {lines ? <div style={bar} /> : null}
    </div>
  );
}

export function CheckIcon({ size, color, stroke }) {
  const s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color || NJ.ok}
        strokeWidth={stroke || 3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon({ size, color, stroke }) {
  const s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke={color || "#FFFFFF"}
        strokeWidth={stroke || 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BellIcon({ size, color }) {
  const s = size || 30;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 16V11a6 6 0 1 1 12 0v5l1.6 2H4.4L6 16z"
        stroke={color || "#FFFFFF"}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" stroke={color || "#FFFFFF"} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function DocIcon({ size, color }) {
  const s = size || 30;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        stroke={color || "#FFFFFF"}
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path d="M9.5 12h5M9.5 16h5" stroke={color || "#FFFFFF"} strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

// Rounded gradient icon tile used across the site's feature rows
export function IconTile({ children, size, radius }) {
  const s = size || 64;
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: radius || 18,
        backgroundImage: NJ.grad,
        boxShadow: NJ.glow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

// ---- Line icons (24px grid, round caps) -------------------------------------

function Glyph({ size, children }) {
  const s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {children}
    </svg>
  );
}

function line(color, width) {
  return {
    stroke: color || "#FFFFFF",
    strokeWidth: width || 2.3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
}

export function UserIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <circle cx="12" cy="8.2" r="3.7" {...line(color)} />
      <path d="M4.8 20.2c.7-4 3.6-6.1 7.2-6.1s6.5 2.1 7.2 6.1" {...line(color)} />
    </Glyph>
  );
}

export function ClockIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <circle cx="12" cy="12" r="8.6" {...line(color)} />
      <path d="M12 7.2V12l3.3 2.2" {...line(color)} />
    </Glyph>
  );
}

export function CalendarIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <rect x="4" y="5.6" width="16" height="14.6" rx="3" {...line(color)} />
      <path d="M4 10.4h16M8.4 3.4v4M15.6 3.4v4" {...line(color)} />
    </Glyph>
  );
}

export function WarningIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M12 4.2 21.2 19.6H2.8L12 4.2z" {...line(color)} />
      <path d="M12 10v4.4" {...line(color)} />
      <circle cx="12" cy="17" r="1.2" fill={color || "#FFFFFF"} />
    </Glyph>
  );
}

export function StarIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path
        d="M12 3.6l2.6 5.2 5.7.9-4.1 4 .9 5.7L12 16.7l-5.1 2.7.9-5.7-4.1-4 5.7-.9L12 3.6z"
        {...line(color)}
      />
    </Glyph>
  );
}

export function FlagIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M6 21V4" {...line(color)} />
      <path d="M6 5h11.5l-2.2 3.8 2.2 3.8H6" {...line(color)} />
    </Glyph>
  );
}

export function MicIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <rect x="9" y="3.2" width="6" height="11" rx="3" {...line(color)} />
      <path d="M5.8 11.6a6.2 6.2 0 0 0 12.4 0M12 17.8V21" {...line(color)} />
    </Glyph>
  );
}

export function ChatIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path
        d="M5 5h14a1.6 1.6 0 0 1 1.6 1.6v8.2A1.6 1.6 0 0 1 19 16.4h-7.2l-4.4 3.4v-3.4H5a1.6 1.6 0 0 1-1.6-1.6V6.6A1.6 1.6 0 0 1 5 5z"
        {...line(color)}
      />
    </Glyph>
  );
}

export function ShieldIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M12 3.2l7 2.6v5.6c0 4.4-2.9 7.7-7 9.4-4.1-1.7-7-5-7-9.4V5.8l7-2.6z" {...line(color)} />
      <path d="M8.8 12l2.3 2.3 4.1-4.4" {...line(color)} />
    </Glyph>
  );
}

export function StopwatchIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <circle cx="12" cy="13.6" r="7.3" {...line(color)} />
      <path d="M12 9.8v3.9l2.5 1.6M9.8 3.2h4.4M12 3.2v3" {...line(color)} />
    </Glyph>
  );
}

export function MuteIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M4 9.6h3.2L12 5.4v13.2l-4.8-4.2H4V9.6z" {...line(color)} />
      <path d="M16 9.4l4.6 5.2M20.6 9.4L16 14.6" {...line(color)} />
    </Glyph>
  );
}

// Four-point spark, used as the "AI" mark. Not the NexJarvis logo.
export function SparkIcon({ size, color }) {
  const c = color || "#FFFFFF";
  return (
    <Glyph size={size}>
      <path d="M10.5 3.2l2.1 5.7 5.7 2.1-5.7 2.1-2.1 5.7-2.1-5.7L2.7 11l5.7-2.1 2.1-5.7z" fill={c} />
      <path d="M18.6 14.6l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z" fill={c} />
    </Glyph>
  );
}

export function CursorIcon({ size }) {
  const s = size || 78;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M10 5 L10 37 L18.5 29.5 L24 42 L30 39.3 L24.6 27 L36 27 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Small illustrations ----------------------------------------------------

// Round avatar face. mood: "neutral" | "happy" | "blank" | "sleep"; look: -1..1 shifts the eyes.
export function Face({ size, hair, mood, look, skin }) {
  const s = size || 120;
  const dx = (look || 0) * 4;
  const ink = NJ.ink;
  const pen = { stroke: ink, strokeWidth: 4.5, strokeLinecap: "round" };
  const eyes =
    mood === "sleep" ? (
      <g>
        <path d="M29 57q6.5 5.5 13 0" {...pen} />
        <path d="M58 57q6.5 5.5 13 0" {...pen} />
      </g>
    ) : (
      <g>
        <circle cx={36 + dx} cy="57" r="5" fill={ink} />
        <circle cx={64 + dx} cy="57" r="5" fill={ink} />
      </g>
    );
  let mouth = <path d="M42 74h16" {...pen} />;
  if (mood === "happy") mouth = <path d="M39 71q11 9 22 0" {...pen} />;
  if (mood === "blank") mouth = <circle cx="50" cy="75" r="4.5" stroke={ink} strokeWidth="4" />;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="52" r="42" fill={skin || "#FFFFFF"} stroke={NJ.violet} strokeWidth="5" />
      <path
        d="M9.5 46C11 24 28 9 50 9s39 15 40.5 37C77 42 67 34 60 25 49 36 31 44 9.5 46z"
        fill={hair || NJ.deep}
      />
      {eyes}
      {mouth}
    </svg>
  );
}

// Left ear by default (bulges to the left, flat side toward the head); flip for the right ear.
export function Ear({ size, flip }) {
  const s = size || 120;
  return (
    <svg
      width={s * 0.667}
      height={s}
      viewBox="0 0 60 90"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : "none" }}
    >
      <path
        d="M54 9C27 3 7 20 8 45c1 22 17 39 46 36z"
        fill="#EDE9FE"
        stroke={NJ.violet}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M43 27c-13-2-21 9-17 20 3 8 1 14 12 18" stroke={NJ.violet} strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}

// ---- Email icons (added for the Email episode) -------------------------------

export function MailIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.8" {...line(color)} />
      <path d="M4.2 7.4l7.8 6 7.8-6" {...line(color)} />
    </Glyph>
  );
}

export function SendIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M20.6 3.6L3.6 10.4l6.6 2.9 2.9 6.6 7.5-16.3z" {...line(color)} />
      <path d="M10.2 13.3l4.6-4.6" {...line(color)} />
    </Glyph>
  );
}

export function PencilIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M4.4 19.6l1-4.4L15.9 4.7a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.8 18.6l-4.4 1z" {...line(color)} />
      <path d="M13.8 6.8l3.4 3.4" {...line(color)} />
    </Glyph>
  );
}

export function TrashIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M4.6 7h14.8M9.6 7V4.8h4.8V7M6.6 7l.9 12.2h9l.9-12.2" {...line(color)} />
      <path d="M10.2 10.6v5.2M13.8 10.6v5.2" {...line(color)} />
    </Glyph>
  );
}

export function EyeIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M2.6 12c2.3-4.1 5.5-6.2 9.4-6.2s7.1 2.1 9.4 6.2c-2.3 4.1-5.5 6.2-9.4 6.2S4.9 16.1 2.6 12z" {...line(color)} />
      <circle cx="12" cy="12" r="2.8" {...line(color)} />
    </Glyph>
  );
}

export function CloseIcon({ size, color, stroke }) {
  return (
    <Glyph size={size}>
      <path d="M6 6l12 12M18 6L6 18" {...line(color, stroke || 3)} />
    </Glyph>
  );
}

// ---- Icon-first layout (Email episode, v2) -----------------------------------
// Key points float above the speaker as a round icon with a small label pill,
// instead of one large card. Everything enters and leaves with a bounce.

const easeOutCubic = Easing.out(Easing.cubic);
const easeInCubic = Easing.in(Easing.cubic);

// 0→1 entrance that starts at `start` seconds. Despite the name it no longer bounces:
// cubic ease-out, no overshoot.
export function bounce(time, start, fps) {
  return interpolate(time, [start, start + 0.32], [0, 1], { ...clamp, easing: easeOutCubic });
}

// Exit scale 1→0 finishing at `end` seconds: a plain cubic ease-out shrink, no swell.
export function exitPop(time, end, len) {
  const l = (len || 0.3) * 0.8;
  return 1 - interpolate(time, [end - l, end], [0, 1], { ...clamp, easing: easeOutCubic });
}

// 0→1 with cubic ease-out between two times (for slides and moves).
export function glide(time, start, end) {
  return interpolate(time, [start, end], [0, 1], { ...clamp, easing: easeOutCubic });
}

export function PackageIcon({ size, color }) {
  return (
    <Glyph size={size}>
      <path d="M12 3.2l8 4.2v9.2l-8 4.2-8-4.2V7.4l8-4.2z" {...line(color)} />
      <path d="M4.4 7.6l7.6 4 7.6-4M12 11.6v9" {...line(color)} />
    </Glyph>
  );
}

export function IconBubble({ children, size, tint }) {
  const s = size || 150;
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: s / 2,
        boxSizing: "border-box",
        backgroundImage: tint || NJ.grad,
        border: "7px solid #FFFFFF",
        boxShadow: "0 24px 46px -14px rgba(91, 84, 232, 0.85), 0 8px 16px rgba(15, 23, 42, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export function LabelPill({ children, color, size, scale }) {
  const fs = size || 42;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: fs * 0.22,
        padding: `${fs * 0.08}px ${fs * 0.5}px ${fs * 0.14}px`,
        borderRadius: fs * 0.48,
        backgroundColor: NJ.paper,
        boxShadow: "0 10px 22px -8px rgba(15, 23, 42, 0.45)",
        fontFamily: NJ.font,
        fontWeight: 900,
        fontSize: fs,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
        color: color || NJ.ink,
        whiteSpace: "nowrap",
        transform: `scale(${scale === undefined ? 1 : scale})`,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, scale, color, size }) {
  const s = size || 58;
  return (
    <div
      style={{
        position: "absolute",
        right: -s * 0.3,
        top: -s * 0.22,
        minWidth: s,
        height: s,
        boxSizing: "border-box",
        padding: `0 ${s * 0.22}px`,
        borderRadius: s / 2,
        backgroundColor: color || NJ.strike,
        border: "5px solid #FFFFFF",
        boxShadow: "0 10px 20px -8px rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: NJ.font,
        fontWeight: 700,
        fontSize: s * 0.5,
        lineHeight: 1,
        color: "#FFFFFF",
        whiteSpace: "nowrap",
        transform: `scale(${scale === undefined ? 1 : scale})`,
      }}
    >
      {children}
    </div>
  );
}

// One floating key point. `x` is the horizontal centre, `y` the top of the bubble.
// `s` is the bounce scale (0 hides it); it also drives the rise and the little tilt.
export function IconItem({ x, y, s, bob, tilt, size, tint, label, labelColor, labelSize, labelScale, badge, children }) {
  const settle = Math.min(1, s);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        opacity: Math.min(1, s * 4),
        transform: `translateY(${(1 - settle) * 30 + (bob || 0)}px) scale(${s}) rotate(${tilt || 0}deg)`,
        transformOrigin: "50% 45%",
      }}
    >
      <div style={{ position: "relative" }}>
        <IconBubble size={size} tint={tint}>
          {children}
        </IconBubble>
        {badge || null}
      </div>
      {label ? (
        <LabelPill color={labelColor} size={labelSize} scale={labelScale}>
          {label}
        </LabelPill>
      ) : null}
    </div>
  );
}

// ---- NJ bot rig ---------------------------------------------------------------
// The user's own bot render (a transparent PNG, 1024 x 1024) with only the eyes
// redrawn over the visor, so it can blink, look around and change expression.

const BOT_IMG = 1024;
const BOT_BOX = { x0: 310, y0: 338, x1: 709, y1: 772 };
const BOT_W = BOT_BOX.x1 - BOT_BOX.x0;
const BOT_H = BOT_BOX.y1 - BOT_BOX.y0;
const BOT_CX = (BOT_BOX.x0 + BOT_BOX.x1) / 2;
const BOT_CY = (BOT_BOX.y0 + BOT_BOX.y1) / 2;
const BOT_EYES = [
  { x: 447, y: 492, side: -1 },
  { x: 569, y: 492, side: 1 },
];
const BOT_GREEN = "#6FF2B4";
const BOT_VISOR = "#0B0C0E";

// Height of the bot for a given width.
export const botHeight = (w) => (BOT_H / BOT_W) * w;

// mode: normal | wide | focused | sleepy | happy | worried | determined | dizzy | star
function BotEye({ c, k, mode, look, blink }) {
  const cx = (c.x + look.dx * 13) * k;
  const cy = (c.y + look.dy * 10) * k;
  const glow = `0 0 ${14 * k}px ${2 * k}px rgba(111, 242, 180, 0.7)`;
  const box = 64 * k;
  const svgStyle = { position: "absolute", left: cx - box / 2, top: cy - box / 2 };
  if (mode === "happy") {
    return (
      <svg width={box} height={box} viewBox="-32 -32 64 64" fill="none" style={svgStyle}>
        <path d="M-19 10 Q0 -24 19 10" stroke={BOT_GREEN} strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }
  if (mode === "dizzy") {
    return (
      <svg width={box} height={box} viewBox="-32 -32 64 64" fill="none" style={svgStyle}>
        <path d="M-15 -17 L15 17 M15 -17 L-15 17" stroke={BOT_GREEN} strokeWidth="11" strokeLinecap="round" />
      </svg>
    );
  }
  if (mode === "star") {
    return (
      <svg width={box} height={box} viewBox="-32 -32 64 64" fill="none" style={svgStyle}>
        <path d="M0 -27 L8 -9 L27 -7 L13 6 L17 25 L0 15 L-17 25 L-13 6 L-27 -7 L-8 -9 Z" fill={BOT_GREEN} />
      </svg>
    );
  }
  let w = 38;
  let h = 58;
  let dy = 0;
  let rot = 0;
  if (mode === "wide") {
    w = 46;
    h = 68;
  } else if (mode === "focused") {
    h = 38;
  } else if (mode === "sleepy") {
    w = 44;
    h = 10;
    dy = 12;
  } else if (mode === "worried") {
    h = 46;
    rot = c.side * 20; // outer ends drop
  } else if (mode === "determined") {
    h = 42;
    rot = c.side * -20; // inner ends drop
  }
  if (mode !== "sleepy") h = Math.max(7, h * (1 - blink));
  return (
    <div
      style={{
        position: "absolute",
        left: cx - (w * k) / 2,
        top: cy + dy * k - (h * k) / 2,
        width: w * k,
        height: h * k,
        borderRadius: Math.min(w, h) * 0.5 * k,
        backgroundColor: BOT_GREEN,
        boxShadow: glow,
        transform: `rotate(${rot}deg)`,
      }}
    />
  );
}

// The bot, centred on (x, y) with width w. `spin` adds a full-body rotation in degrees.
export function NjBot({ x, y, w, src, look, mode, blink, tilt, spin, opacity }) {
  const k = w / BOT_W;
  const eyeLook = look || { dx: 0, dy: 0 };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity: opacity === undefined ? 1 : opacity,
        transform: `rotate(${tilt || 0}deg)`,
        transformOrigin: `0px ${(BOT_H * k) / 2}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -BOT_CX * k,
          top: -BOT_CY * k,
          width: BOT_IMG * k,
          height: BOT_IMG * k,
          transform: `rotate(${spin || 0}deg)`,
          transformOrigin: `${BOT_CX * k}px ${BOT_CY * k}px`,
        }}
      >
        {src ? <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: BOT_IMG * k, height: BOT_IMG * k }} /> : null}
        <div
          style={{
            position: "absolute",
            left: 404 * k,
            top: 450 * k,
            width: 210 * k,
            height: 86 * k,
            borderRadius: 30 * k,
            backgroundColor: BOT_VISOR,
            boxShadow: `0 0 ${8 * k}px ${5 * k}px ${BOT_VISOR}`,
          }}
        />
        {BOT_EYES.map((c, i) => (
          <BotEye key={i} c={c} k={k} mode={mode || "normal"} look={eyeLook} blink={blink || 0} />
        ))}
      </div>
    </div>
  );
}
