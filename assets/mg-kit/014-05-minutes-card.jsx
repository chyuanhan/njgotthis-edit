import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import {
  NJ,
  clamp,
  prog,
  pop,
  outro,
  Card,
  IconTile,
  DocIcon,
  CheckIcon,
  StarIcon,
  FlagIcon,
  WarningIcon,
  UserIcon,
  ClockIcon,
  MicIcon,
} from "./nj-kit.jsx";

// One pictogram per recorded item: summary, decisions, blockers, owner, deadline.
const TILE_ICONS = [StarIcon, FlagIcon, WarningIcon, UserIcon, ClockIcon];

function Wave({ t, active, color }) {
  const bars = [0, 1, 2, 3].map((i) => {
    const h = active ? 10 + 16 * Math.abs(Math.sin(t * 7 + i * 1.3)) : 8;
    return (
      <div
        key={i}
        style={{ width: 6, height: h, borderRadius: 3, backgroundColor: color || "#FFFFFF" }}
      />
    );
  });
  return <div style={{ display: "flex", alignItems: "center", gap: 5, height: 30 }}>{bars}</div>;
}

// Meeting-minutes UI card. Five recorded items fill in one by one as each is spoken;
// the NexJarvis "word-for-word" capability lands as a separate banner underneath.
export default function MinutesCard({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;
  const out = outro(t, dur, 0.28);
  const inP = pop(t, 0.05, fps);

  const labels = [p.item1, p.item2, p.item3, p.item4, p.item5];
  const times = [p.time1, p.time2, p.time3, p.time4, p.time5];
  const done = t >= p.doneTime;
  const doneP = pop(t, p.doneTime, fps, { damping: 9, stiffness: 240, mass: 0.6 });

  const tiles = labels.map((label, i) => {
    const s = pop(t, times[i], fps, { damping: 11, stiffness: 240, mass: 0.6 });
    const filled = t >= times[i];
    const TileIcon = TILE_ICONS[i];
    const iconP = pop(t, times[i] + 0.06, fps, { damping: 8, stiffness: 260, mass: 0.5 });
    const shimmer = 0.5 + 0.3 * Math.sin(t * 4 + i * 0.9);
    const base = {
      height: 80,
      borderRadius: 22,
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "0 16px",
      position: "relative",
    };
    if (!filled) {
      return (
        <div key={i} style={{ ...base, backgroundColor: NJ.mist }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#E2E4F3", opacity: shimmer }} />
          <div style={{ width: 110 + (i % 3) * 25, height: 22, borderRadius: 11, backgroundColor: "#E2E4F3", opacity: shimmer }} />
        </div>
      );
    }
    return (
      <div
        key={i}
        style={{
          ...base,
          backgroundColor: "#F1EFFE",
          border: "2px solid #DDD9FB",
          transform: `scale(${interpolate(s, [0, 1], [0.86, 1], clamp)})`,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: NJ.violet,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transform: `scale(${iconP}) rotate(${(1 - iconP) * -40}deg)`,
          }}
        >
          <TileIcon size={30} color="#FFFFFF" />
        </div>
        <div
          style={{
            fontFamily: NJ.fontZh,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: "-0.01em",
            color: p.inkColor,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    );
  });

  // NexJarvis capability banner: "一字不漏" describes how it records, not a recorded item.
  const featOn = t >= p.time6;
  const featP = pop(t, p.time6, fps, { damping: 11, stiffness: 220, mass: 0.6 });
  const featIconP = pop(t, p.time6 + 0.08, fps, { damping: 8, stiffness: 260, mass: 0.5 });
  const featShimmer = 0.5 + 0.3 * Math.sin(t * 4 + 5 * 0.9);
  const banner = featOn ? (
    <div
      style={{
        height: 100,
        borderRadius: 24,
        backgroundColor: NJ.deep,
        backgroundImage: NJ.grad,
        boxShadow: NJ.glow,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 26px 0 20px",
        transform: `scale(${interpolate(featP, [0, 1], [0.88, 1], clamp)})`,
        opacity: Math.min(1, featP * 1.6),
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: `scale(${featIconP}) rotate(${(1 - featIconP) * -40}deg)`,
        }}
      >
        <MicIcon size={36} color={NJ.deep} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: NJ.font,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.78)",
            whiteSpace: "nowrap",
          }}
        >
          {p.featureLabel}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div
            style={{
              fontFamily: NJ.fontZh,
              fontWeight: 900,
              fontSize: 48,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {p.item6}
          </div>
          <div
            style={{
              fontFamily: NJ.fontZh,
              fontWeight: 700,
              fontSize: 30,
              color: "rgba(255,255,255,0.88)",
              whiteSpace: "nowrap",
            }}
          >
            {p.featureTail}
          </div>
        </div>
      </div>
      <Wave t={t} active={!done} />
    </div>
  ) : (
    <div
      style={{
        height: 100,
        borderRadius: 24,
        backgroundColor: NJ.mist,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 20px",
      }}
    >
      <div style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: "#E2E4F3", opacity: featShimmer }} />
      <div style={{ width: 300, height: 26, borderRadius: 13, backgroundColor: "#E2E4F3", opacity: featShimmer }} />
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(1, prog(t, 0.05, 0.25)) * out,
        transform: `translateY(${(1 - inP) * 50 - (1 - out) * 24}px) scale(${0.92 + 0.08 * inP})`,
      }}
    >
      <Card style={{ width: 900, padding: "26px 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <IconTile size={68} radius={20}>
            <DocIcon size={38} />
          </IconTile>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 48,
                lineHeight: 1.1,
                color: p.inkColor,
                whiteSpace: "nowrap",
              }}
            >
              {p.title}
            </div>
            <div
              style={{
                fontFamily: NJ.font,
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: NJ.eyebrow,
                whiteSpace: "nowrap",
              }}
            >
              {p.subtitle}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 22px",
              borderRadius: 999,
              backgroundImage: NJ.gradCyan,
              boxShadow: "0 12px 26px -12px rgba(79, 70, 229, 0.9)",
              transform: `scale(${done ? 0.85 + 0.15 * doneP : 1})`,
            }}
          >
            {done ? <CheckIcon size={30} color="#FFFFFF" stroke={3.6} /> : <Wave t={t} active />}
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 900,
                fontSize: 30,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
              }}
            >
              {done ? p.statusDone : p.status}
            </div>
          </div>
        </div>
        <div style={{ height: 2, backgroundColor: NJ.line }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>{tiles[0]}</div>
            <div style={{ flex: 1 }}>{tiles[1]}</div>
            <div style={{ flex: 1 }}>{tiles[2]}</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>{tiles[3]}</div>
            <div style={{ flex: 1 }}>{tiles[4]}</div>
          </div>
        </div>
        {banner}
      </Card>
    </div>
  );
}
