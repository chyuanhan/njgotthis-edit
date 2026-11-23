import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { NJ, clamp, bounce, exitPop, IconItem, Badge, MailIcon, PackageIcon, UserIcon, BellIcon } from "./nj-kit.jsx";

const ICONS = [PackageIcon, UserIcon, BellIcon];
const TINTS = [NJ.grad, NJ.gradCyan, "linear-gradient(60deg, #A78BFA 0%, #6366F1 100%)"];
const XS = [190, 500, 810];

// Icon layout: one mail icon whose unread badge climbs while he says "一堆的 email",
// then it pops away and three sender icons bounce in as he names them.
export default function InboxIcons({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;

  const mailIn = bounce(t, 0.06, fps);
  const mailLabel = bounce(t, 0.3, fps);
  const mailOut = exitPop(t, p.splitTime + 0.3, 0.3);
  const count = Math.round(interpolate(t, [0.3, p.countEnd], [3, 99], clamp));
  const ticking = 1;
  const badgeIn = bounce(t, 0.26, fps);

  const names = [p.row1, p.row2, p.row3];
  const badges = [p.badge1, p.badge2, p.badge3];
  const times = [p.time1, p.time2, p.time3];

  const row = names.map((name, i) => {
    const s = bounce(t, times[i], fps) * exitPop(t, dur - (2 - i) * 0.05, 0.3);
    const b = bounce(t, times[i] + 0.16, fps);
    const Icon = ICONS[i];
    return (
      <IconItem
        key={i}
        x={XS[i]}
        y={52}
        s={s}
        bob={Math.sin(t * 2.6 + i * 1.3) * 5}
        size={180}
        tint={TINTS[i]}
        label={name}
        labelColor={p.inkColor}
        labelSize={48}
        labelScale={bounce(t, times[i] + 0.08, fps)}
        badge={badges[i] ? <Badge scale={b}>{badges[i]}</Badge> : null}
      >
        <Icon size={110} color="#FFFFFF" />
      </IconItem>
    );
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <IconItem
        x={500}
        y={34}
        s={mailIn * mailOut}
        bob={Math.sin(t * 2.6) * 5}
        size={204}
        label={p.mailLabel}
        labelColor={p.inkColor}
        labelSize={54}
        labelScale={mailLabel}
        badge={
          <Badge scale={badgeIn * ticking} size={72}>
            {count >= 99 ? "99+" : String(count)}
          </Badge>
        }
      >
        <MailIcon size={128} color="#FFFFFF" />
      </IconItem>
      {row}
    </div>
  );
}
