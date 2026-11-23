import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";

// NexJarvis caption: heavy white text with a soft black drop shadow (shadowOpacity, default 40%), no card.
// Key words are brand indigo, Black weight, on their own white background pill.
const INK = "#FFFFFF";
const KEY = "#4F46E5";
const FONT = '"Noto Sans SC", "Instrument Sans", sans-serif';
const FONT_LATIN = '"Instrument Sans", "Noto Sans SC", sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

function units(text) {
  let n = 0;
  for (const ch of text) n += /[⺀-鿿＀-￯]/.test(ch) ? 1 : 0.56;
  return n;
}

function buildGroups(words) {
  const groups = [];
  let current = null;
  let pendingSpace = false;
  words.forEach((w) => {
    const raw = w.text || "";
    const text = raw.trim();
    if (!text) {
      pendingSpace = true;
      return;
    }
    const gid = w.wordGroupId || w.id;
    const spaced = pendingSpace || /^\s/.test(raw);
    pendingSpace = /\s$/.test(raw);
    if (!current || current.id !== gid) {
      current = {
        id: gid,
        text: "",
        lead: spaced && groups.length > 0,
        start: w.timelineStartFrame,
        end: w.timelineEndFrame,
        emphasis: false,
      };
      groups.push(current);
    }
    current.text += text;
    current.start = Math.min(current.start, w.timelineStartFrame);
    current.end = Math.max(current.end, w.timelineEndFrame);
    if (w.emphasis === true && w.emphasisSource !== "suppressed") current.emphasis = true;
  });
  return groups;
}

function splitLines(groups, limit) {
  const total = groups.reduce((s, g) => s + units(g.text), 0);
  if (total <= limit || groups.length < 2) return [groups];
  let best = 1;
  let bestDiff = Infinity;
  let acc = 0;
  for (let i = 0; i < groups.length - 1; i++) {
    acc += units(groups[i].text);
    const diff = Math.abs(total - 2 * acc);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i + 1;
    }
  }
  return [groups.slice(0, best), groups.slice(best)];
}

export default function NexJarvisCaption({ item }) {
  const localFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fx = typeof useSpecialEffects === "function" ? useSpecialEffects() : null;
  const cap = fx ? fx.caption_v1 : null;
  const p = (item && item.props) || {};
  const baseSize = p.textSize || 66;
  // 11 full-width characters per line keeps every line inside the 868px caption box
  // (IG Reels safe area x 60–960, minus a small margin).
  const lineLimit = p.lineLimit || 11;
  const shadowOpacity = typeof p.shadowOpacity === "number" ? p.shadowOpacity : 0.4;
  const textShadow = `0 3px 8px rgba(0, 0, 0, ${shadowOpacity})`;
  // Key-word pill keeps its own shadow so white-text shadow can change independently.
  const pillShadowOpacity = typeof p.pillShadowOpacity === "number" ? p.pillShadowOpacity : 0.4;

  if (!cap || !cap.content || !cap.content.words || cap.content.words.length === 0) {
    return null;
  }

  const frame = cap.active && typeof cap.active.frame === "number" ? cap.active.frame : cap.timing.startFrame + localFrame;
  const groups = buildGroups(cap.content.words);
  const lines = splitLines(groups, lineLimit);
  const t = localFrame / fps;

  const enter = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 230, mass: 0.6 } });
  const cardIn = interpolate(t, [0, 0.12], [0, 1], clamp);

  const keyBackground = p.keyBackground || "#FFFFFF";

  // firstInPill: the group opens a key-word pill, so the pill supplies its spacing.
  const renderGroup = (g, key, firstInPill) => {
    const since = (frame - g.start) / fps;
    const spoken = interpolate(since, [-0.04, 0.1], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const latin = /^[\x00-\x7F]+$/.test(g.text);
    const bump = g.emphasis
      ? 1 + 0.07 * Math.sin(Math.PI * interpolate(since, [0, 0.34], [0, 1], clamp))
      : 1 + 0.05 * Math.sin(Math.PI * interpolate(since, [0, 0.22], [0, 1], clamp));
    const size = g.emphasis ? baseSize * 1.1 : baseSize;
    const lead = !firstInPill && (g.lead || (latin && key > 0));
    return (
      <div
        key={key}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          marginLeft: lead ? baseSize * 0.24 : 0,
          marginRight: latin && !g.emphasis ? baseSize * 0.06 : 0,
          transform: `scale(${bump})`,
        }}
      >
        <div
          style={{
            position: "relative",
            fontFamily: latin ? FONT_LATIN : FONT,
            fontWeight: g.emphasis ? 900 : latin ? 700 : 800,
            fontSize: size,
            lineHeight: 1.22,
            letterSpacing: latin ? "-0.03em" : "0em",
            color: g.emphasis ? KEY : INK,
            opacity: 0.82 + 0.18 * spoken,
            textShadow: g.emphasis ? "none" : textShadow,
            whiteSpace: "nowrap",
          }}
        >
          {g.text}
        </div>
      </div>
    );
  };

  // Neighbouring key words share one background pill.
  const toRuns = (line) => {
    const runs = [];
    line.forEach((g) => {
      const last = runs[runs.length - 1];
      if (last && last.emphasis === g.emphasis) last.groups.push(g);
      else runs.push({ emphasis: g.emphasis, groups: [g] });
    });
    return runs;
  };

  let index = 0;
  const renderRun = (run, key) => {
    if (!run.emphasis) return run.groups.map((g) => renderGroup(g, index++, false));
    const since = (frame - run.groups[0].start) / fps;
    const pillPop = 1 + 0.06 * Math.sin(Math.PI * interpolate(since, [0, 0.3], [0, 1], clamp));
    return (
      <div
        key={`pill-${key}`}
        style={{
          display: "flex",
          alignItems: "center",
          margin: `0 ${baseSize * 0.14}px`,
          padding: `0 ${baseSize * 0.2}px ${baseSize * 0.03}px`,
          borderRadius: baseSize * 0.3,
          backgroundColor: keyBackground,
          boxShadow: `0 3px 8px rgba(0, 0, 0, ${pillShadowOpacity})`,
          transform: `scale(${pillPop})`,
        }}
      >
        {run.groups.map((g, gi) => renderGroup(g, index++, gi === 0))}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "12px 38px 16px",
          opacity: cardIn,
          transform: `translateY(${(1 - enter) * 18}px) scale(${0.94 + 0.06 * enter})`,
        }}
      >
        {lines.map((line, li) => (
          <div key={li} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {toRuns(line).map((run, ri) => renderRun(run, `${li}-${ri}`))}
          </div>
        ))}
      </div>
    </div>
  );
}
