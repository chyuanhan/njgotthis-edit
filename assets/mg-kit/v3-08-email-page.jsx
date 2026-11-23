import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import {
  NJ,
  clamp,
  prog,
  bounce,
  exitPop,
  glide,
  IconTile,
  MailIcon,
  SendIcon,
  PencilIcon,
  StarIcon,
  CheckIcon,
  CursorIcon,
  DocIcon,
  TrashIcon,
  ClockIcon,
  NjBot,
} from "./nj-kit.jsx";

// Full-frame email client that sits BEHIND the speaker (the placed item carries a
// portrait track matte). A virtual camera follows the cursor through three steps:
// AI writes the reply, it matches the supplier's email, and the Send button lights up.
// Everything the viewer must read is framed into the band above the speaker's head.

// Canvas point the camera keeps its focus on: the middle of the free band above the head
// The horizontal centre comes from the centerX property (frame centre 540 by default;
// 510 is the centre of the IG Reels safe area x 60–960).
const TARGET = { y: 540 };

// Camera shots: zoom and the page point that lands on TARGET.
const SHOT = {
  overview: { s: 0.72, x: 750, y: 505 },
  draft: { s: 0.88, x: 895, y: 858 },
  mail: { s: 0.9, x: 895, y: 436 },
  send: { s: 1.42, x: 1286, y: 1070 },
  // Bot version: wider, so the bot standing left of the button fits in the band too.
  sendBot: { s: 1.3, x: 1190, y: 1062 },
};

// Where the NJ bot stands inside the page (bot version only), in page coordinates.
// `enter` matches the spot the front-layer bot hands over from: canvas (860, 640), width 176
// (clear of the "The Best Part" badge, which is drawn above the page).
const BOT_SPOT = {
  enter: { x: 1236, y: 644, w: 244 },
  draft: { x: 1290, y: 880, w: 190 },
  mail: { x: 1330, y: 470, w: 170 },
  send: { x: 1060, y: 1062, w: 185 },
};

const mix = (a, b, u) => a + (b - a) * u;
const mixShot = (a, b, u) => ({ s: mix(a.s, b.s, u), x: mix(a.x, b.x, u), y: mix(a.y, b.y, u) });
const mixPt = (a, b, u) => ({ x: mix(a.x, b.x, u), y: mix(a.y, b.y, u) });

const FOLDERS = [
  { label: "Inbox", Icon: MailIcon, active: true, badge: "99+" },
  { label: "Starred", Icon: StarIcon },
  { label: "Sent", Icon: SendIcon },
  { label: "Drafts", Icon: DocIcon },
  { label: "Later", Icon: ClockIcon },
  { label: "Trash", Icon: TrashIcon },
];

const LIST_TINTS = [NJ.gradCyan, NJ.grad, "linear-gradient(60deg, #A78BFA 0%, #6366F1 100%)"];

function Bar({ width, height, color, opacity }) {
  return (
    <div
      style={{
        width,
        height: height || 18,
        borderRadius: (height || 18) / 2,
        backgroundColor: color || "#E2E4F3",
        opacity: opacity === undefined ? 1 : opacity,
      }}
    />
  );
}

export default function EmailPage({ item }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = item.props;

  // ---- whole layer in / out -------------------------------------------------
  const fadeIn = prog(t, 0, 0.2);
  const fadeOut = interpolate(t, [dur - 0.24, dur], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });
  const winIn = bounce(t, 0.02, fps);
  const winY = (1 - winIn) * 620 + (1 - fadeOut) * 420;

  // ---- camera ---------------------------------------------------------------
  const toDraft = glide(t, p.draftTime - 0.38, p.draftTime + 0.14);
  const toMail = glide(t, p.mailTime - 0.12, p.mailTime + 0.4);
  const toSend = glide(t, p.buttonTime - 0.18, p.buttonTime + 0.36);
  let cam = mixShot(SHOT.overview, SHOT.draft, toDraft);
  cam = mixShot(cam, SHOT.mail, toMail);
  const withBot = !!p.botImage;
  const pressT = Number(p.pressTime || 0);
  const pressed = pressT > 0 && t >= pressT;
  cam = mixShot(cam, withBot ? SHOT.sendBot : SHOT.send, toSend);
  const drift = Math.sin(t * 0.9) * 6; // a little life while the camera holds
  const cx = p.centerX || 540;
  const camX = cx - cam.x * cam.s + drift;
  const camY = TARGET.y - cam.y * cam.s + winY;

  // ---- step state -----------------------------------------------------------
  const stepStart = p.draftTime - 0.34;
  const step = pressed ? 3 : t >= p.buttonTime ? 2 : t >= p.mailTime ? 1 : 0;
  const body1 = String(p.body1 || "");
  const body2 = String(p.body2 || "");
  const typedAll = Math.round(
    interpolate(t, [p.draftTime, p.mailTime - 0.12], [0, body1.length + body2.length], clamp)
  );
  const typed1 = Math.min(body1.length, typedAll);
  const typed2 = Math.max(0, typedAll - body1.length);
  const typing = t >= p.draftTime && typedAll < body1.length + body2.length;
  const written = t >= p.mailTime - 0.1;
  const writtenP = bounce(t, p.mailTime - 0.1, fps);
  const caretOn = Math.sin(t * 14) > 0 ? 1 : 0;

  const matchP = bounce(t, p.mailTime + 0.16, fps);
  const matchOn = t >= p.mailTime + 0.1 && t < p.buttonTime - 0.1;

  const lit = t >= p.buttonTime;
  const btnBump = 1;
  const pulse = lit && !pressed ? 1 + 0.035 * Math.sin((t - p.buttonTime) * 9) : 1;
  const ringT = pressed ? prog(t, pressT, pressT + 0.5) : lit ? ((t - p.buttonTime) % 0.9) / 0.9 : 0;
  const squash = pressed ? 0.1 * Math.sin(Math.PI * interpolate(t - pressT, [0, 0.22], [0, 1], clamp)) : 0;

  // ---- NJ bot inside the page (bot version) -----------------------------------
  // It hops from spot to spot, "types" the draft, points at the matching email,
  // then walks up to Send and bumps it with its head at pressT.
  const hop1 = glide(t, 0.5, 0.98);
  const hop2 = glide(t, p.mailTime - 0.2, p.mailTime + 0.26);
  const hop3 = glide(t, p.buttonTime - 0.3, p.buttonTime + 0.22);
  let bot = { ...BOT_SPOT.enter };
  [
    [BOT_SPOT.draft, hop1],
    [BOT_SPOT.mail, hop2],
    [BOT_SPOT.send, hop3],
  ].forEach(([spot, u]) => {
    bot = { x: mix(bot.x, spot.x, u), y: mix(bot.y, spot.y, u), w: mix(bot.w, spot.w, u) };
  });
  const botArc = [hop1, hop2, hop3].reduce((acc, u) => acc + (u > 0 && u < 1 ? 90 * Math.sin(Math.PI * u) : 0), 0);
  const botDash = pressT > 0 ? 66 * (glide(t, pressT - 0.12, pressT) - glide(t, pressT, pressT + 0.26)) : 0;
  const windUp = pressT > 0 ? -22 * (glide(t, pressT - 0.4, pressT - 0.14) - glide(t, pressT - 0.12, pressT)) : 0;
  const botX = bot.x + botDash + windUp;
  const botY = bot.y - botArc + Math.sin(t * 2.2) * 4;
  let botMode = "normal";
  let botLook = { dx: -0.5, dy: 0.6 };
  if (t >= 0.5) botLook = { dx: -0.9, dy: 0.3 };
  if (t >= p.draftTime && t < p.mailTime - 0.1) botMode = "focused";
  if (t >= p.mailTime - 0.2) botLook = { dx: -0.9, dy: -0.1 };
  if (t >= p.mailTime + 0.16 && t < p.mailTime + 0.8) botMode = "happy";
  if (t >= p.buttonTime - 0.3) {
    botMode = "determined";
    botLook = { dx: 0.9, dy: 0.1 };
  }
  if (pressed) {
    botMode = "star";
    botLook = { dx: 0, dy: 0 };
  }
  const botPhase = t % 2.7;
  const botBlink = botPhase < 0.13 ? Math.sin((botPhase / 0.13) * Math.PI) : 0;
  const botTilt = typing ? Math.sin(t * 30) * 3 : 0;

  // ---- cursor (page space, so the camera follows it) --------------------------
  const CUR = { rest: { x: 1130, y: 930 }, mail: { x: 1010, y: 500 }, send: { x: 1300, y: 1084 } };
  let cur = mixPt(CUR.rest, CUR.mail, glide(t, p.mailTime - 0.22, p.mailTime + 0.26));
  cur = mixPt(cur, CUR.send, glide(t, p.buttonTime - 0.28, p.buttonTime + 0.3));
  const curIn = bounce(t, stepStart + 0.1, fps);
  const hover = lit ? Math.sin((t - p.buttonTime) * 5) * 4 : 0;

  // ---- overlays (canvas space) ----------------------------------------------
  const badgeIn = bounce(t, 0.1, fps);
  const badgeBump = 1;
  const badgeOut = exitPop(t, p.cardTime + 0.28, 0.3);
  const steps = [p.step1, p.step2, p.step3];
  const stepTimes = [stepStart, p.mailTime, p.buttonTime];

  const dots = [0, 1, 2].map((i) => (
    <div
      key={i}
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
        opacity: 0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - i * 0.9)),
      }}
    />
  ));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: Math.min(fadeIn, fadeOut),
        backgroundImage: "linear-gradient(160deg, #E4DFFF 0%, #D6F1FF 100%)",
      }}
    >
      {/* ---------------- the page, moved by the camera ---------------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1500,
          height: 2500,
          transformOrigin: "0 0",
          transform: `translate(${camX}px, ${camY}px) scale(${cam.s})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 46,
            backgroundColor: NJ.mist,
            border: `2px solid ${NJ.line}`,
            boxShadow: "0 60px 120px -40px rgba(91, 84, 232, 0.55)",
            overflow: "hidden",
          }}
        >
          {/* title bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              height: 90,
              backgroundColor: NJ.paper,
              borderBottom: `2px solid ${NJ.line}`,
              display: "flex",
              alignItems: "center",
              padding: "0 36px",
              gap: 14,
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: NJ.violet }} />
            <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: NJ.cyan }} />
            <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#CBD5E1" }} />
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontFamily: NJ.font,
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: "-0.02em",
                color: NJ.muted,
                whiteSpace: "nowrap",
              }}
            >
              {p.windowTitle}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 100 }} />
          </div>

          {/* sidebar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 90,
              bottom: 0,
              width: 300,
              backgroundColor: NJ.paper,
              borderRight: `2px solid ${NJ.line}`,
              padding: "30px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                height: 84,
                borderRadius: 26,
                backgroundImage: NJ.grad,
                boxShadow: NJ.glow,
                fontFamily: NJ.font,
                fontWeight: 900,
                fontSize: 36,
                color: "#FFFFFF",
                marginBottom: 18,
                whiteSpace: "nowrap",
              }}
            >
              <PencilIcon size={38} color="#FFFFFF" />
              {p.composeLabel}
            </div>
            {FOLDERS.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  height: 76,
                  padding: "0 16px",
                  borderRadius: 22,
                  backgroundColor: f.active ? "#F1EFFE" : "transparent",
                }}
              >
                <f.Icon size={36} color={f.active ? NJ.violet : NJ.muted} />
                <div
                  style={{
                    fontFamily: NJ.font,
                    fontWeight: 700,
                    fontSize: 34,
                    letterSpacing: "-0.02em",
                    color: f.active ? NJ.ink : NJ.muted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                </div>
                <div style={{ flex: 1 }} />
                {f.badge ? (
                  <div
                    style={{
                      padding: "2px 12px 4px",
                      borderRadius: 16,
                      backgroundColor: NJ.strike,
                      fontFamily: NJ.font,
                      fontWeight: 700,
                      fontSize: 24,
                      color: "#FFFFFF",
                    }}
                  >
                    {f.badge}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* search bar */}
          <div
            style={{
              position: "absolute",
              left: 340,
              top: 120,
              width: 1120,
              height: 76,
              borderRadius: 38,
              backgroundColor: NJ.paper,
              border: `2px solid ${NJ.line}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              padding: "0 30px",
              gap: 16,
            }}
          >
            <div style={{ width: 26, height: 26, borderRadius: 13, border: `4px solid ${NJ.muted}`, boxSizing: "border-box" }} />
            <Bar width={260} height={16} />
          </div>

          {/* the supplier's email */}
          <div
            style={{
              position: "absolute",
              left: 340,
              top: 230,
              width: 1120,
              height: 380,
              boxSizing: "border-box",
              padding: "34px 38px",
              borderRadius: 34,
              backgroundColor: NJ.paper,
              border: `2px solid ${NJ.line}`,
              boxShadow: "0 18px 40px -24px rgba(15, 23, 42, 0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  backgroundImage: NJ.grad,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: NJ.font,
                  fontWeight: 700,
                  fontSize: 50,
                  color: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                {String(p.sender || "S").slice(0, 1)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontFamily: NJ.font,
                    fontWeight: 700,
                    fontSize: 50,
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    color: NJ.ink,
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.sender}
                </div>
                <Bar width={300} height={16} />
              </div>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  padding: "4px 20px 6px",
                  borderRadius: 18,
                  backgroundColor: "#F1EFFE",
                  fontFamily: NJ.font,
                  fontWeight: 700,
                  fontSize: 28,
                  color: NJ.violet,
                  whiteSpace: "nowrap",
                }}
              >
                9:41 AM
              </div>
            </div>
            <div
              style={{
                fontFamily: NJ.font,
                fontWeight: 900,
                fontSize: 56,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: NJ.ink,
                whiteSpace: "nowrap",
              }}
            >
              {p.subject}
            </div>
            <div
              style={{
                fontFamily: NJ.fontZh,
                fontWeight: 500,
                fontSize: 38,
                color: NJ.body,
                whiteSpace: "nowrap",
              }}
            >
              {p.mailBody}
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <Bar width={420} />
              <Bar width={260} />
            </div>
          </div>

          {/* "this is the email being answered" ring + tag */}
          <div
            style={{
              position: "absolute",
              left: 326,
              top: 216,
              width: 1148,
              height: 408,
              boxSizing: "border-box",
              borderRadius: 44,
              border: `8px solid ${NJ.cyan}`,
              opacity: matchOn ? Math.min(1, matchP * 3) : 0,
              transform: `scale(${1.04 - 0.04 * Math.min(1, matchP)})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: withBot ? 960 : 1120,
              top: withBot ? 378 : 366,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 26px 10px 18px",
              borderRadius: 26,
              backgroundImage: NJ.gradCyan,
              boxShadow: NJ.glow,
              fontFamily: NJ.font,
              fontWeight: 900,
              fontSize: 40,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
              opacity: matchOn ? Math.min(1, matchP * 3) : 0,
              transform: `scale(${matchP}) rotate(${(1 - matchP) * 10 - 3}deg)`,
              transformOrigin: "50% 100%",
            }}
          >
            <CheckIcon size={38} color="#FFFFFF" stroke={4} />
            {p.matchTag}
          </div>

          {/* reply being drafted */}
          <div
            style={{
              position: "absolute",
              left: 340,
              top: 650,
              width: 1120,
              height: 500,
              boxSizing: "border-box",
              padding: "32px 38px",
              borderRadius: 34,
              backgroundColor: NJ.paper,
              border: "3px solid #C7C2F7",
              boxShadow: "0 30px 60px -30px rgba(91, 84, 232, 0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <IconTile size={76} radius={22}>
                <PencilIcon size={46} color="#FFFFFF" />
              </IconTile>
              <div
                style={{
                  fontFamily: NJ.font,
                  fontWeight: 900,
                  fontSize: 48,
                  letterSpacing: "-0.01em",
                  color: NJ.ink,
                  whiteSpace: "nowrap",
                }}
              >
                {p.replyTitle}
              </div>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 26px 10px 20px",
                  borderRadius: 999,
                  backgroundImage: written ? "none" : NJ.gradCyan,
                  backgroundColor: written ? NJ.okBg : "transparent",
                  fontFamily: NJ.font,
                  fontWeight: 900,
                  fontSize: 36,
                  color: written ? NJ.ok : "#FFFFFF",
                  whiteSpace: "nowrap",
                  transform: `scale(${written ? 0.7 + 0.3 * writtenP : 1})`,
                }}
              >
                {written ? (
                  <CheckIcon size={34} color={NJ.ok} stroke={4} />
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>{dots}</div>
                )}
                {written ? p.statusDone : p.status}
              </div>
            </div>
            <div style={{ height: 2, backgroundColor: NJ.line }} />
            <div
              style={{
                fontFamily: NJ.font,
                fontWeight: 600,
                fontSize: 30,
                color: NJ.muted,
                whiteSpace: "nowrap",
              }}
            >
              {p.toLine}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, height: 140 }}>
              <div style={{ display: "flex", alignItems: "center", height: 66 }}>
                <div
                  style={{
                    fontFamily: NJ.fontZh,
                    fontWeight: 800,
                    fontSize: 50,
                    lineHeight: 1.2,
                    color: NJ.ink,
                    whiteSpace: "nowrap",
                  }}
                >
                  {body1.slice(0, typed1)}
                </div>
                {typed2 === 0 ? (
                  <div
                    style={{
                      width: 6,
                      height: 52,
                      marginLeft: 5,
                      borderRadius: 3,
                      backgroundColor: NJ.violet,
                      opacity: typing ? 1 : written ? 0 : caretOn,
                    }}
                  />
                ) : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", height: 66 }}>
                <div
                  style={{
                    fontFamily: NJ.fontZh,
                    fontWeight: 800,
                    fontSize: 50,
                    lineHeight: 1.2,
                    color: NJ.ink,
                    whiteSpace: "nowrap",
                  }}
                >
                  {body2.slice(0, typed2)}
                </div>
                {typed2 > 0 ? (
                  <div
                    style={{
                      width: 6,
                      height: 52,
                      marginLeft: 5,
                      borderRadius: 3,
                      backgroundColor: NJ.violet,
                      opacity: typing ? 1 : 0,
                    }}
                  />
                ) : null}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: NJ.mist }} />
              <div style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: NJ.mist }} />
              <div style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: NJ.mist }} />
              <div style={{ flex: 1 }} />
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: -14,
                    right: -14,
                    top: -14,
                    bottom: -14,
                    borderRadius: 46,
                    border: `7px solid ${NJ.cyan}`,
                    opacity: pressed ? (ringT < 1 ? 1 - ringT : 0) : lit ? 1 - ringT : 0,
                    transform: `scale(${0.94 + (pressed ? 0.5 : 0.2) * ringT})`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    height: 96,
                    padding: "0 42px 0 38px",
                    borderRadius: 32,
                    backgroundImage: pressed ? "linear-gradient(60deg, #34D399 0%, #047857 100%)" : NJ.grad,
                    boxShadow: NJ.glow,
                    transform: `scale(${btnBump * pulse * (1 - squash)}, ${btnBump * pulse * (1 + squash * 0.5)})`,
                    transformOrigin: "100% 50%",
                  }}
                >
                  <div
                    style={{
                      fontFamily: NJ.font,
                      fontWeight: 700,
                      fontSize: 54,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      color: "#FFFFFF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pressed ? p.sentLabel : p.buttonLabel}
                  </div>
                  {pressed ? <CheckIcon size={46} color="#FFFFFF" stroke={4} /> : <SendIcon size={46} color="#FFFFFF" />}
                </div>
              </div>
            </div>
          </div>

          {/* the rest of the inbox, only there to fill the screen behind him */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 340,
                top: 1190 + i * 142,
                width: 1120,
                height: 122,
                boxSizing: "border-box",
                padding: "0 30px",
                borderRadius: 28,
                backgroundColor: NJ.paper,
                border: `2px solid ${NJ.line}`,
                display: "flex",
                alignItems: "center",
                gap: 22,
              }}
            >
              <div style={{ width: 68, height: 68, borderRadius: 34, backgroundImage: LIST_TINTS[i % 3], flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Bar width={220 + (i % 3) * 60} height={20} color="#CBD5E1" />
                <Bar width={520 - (i % 4) * 70} height={16} />
              </div>
            </div>
          ))}

          {/* cursor, or in the bot version the NJ bot itself */}
          {withBot ? (
            <NjBot
              x={botX}
              y={botY}
              w={bot.w}
              src={p.botImage}
              look={botLook}
              mode={botMode}
              blink={botBlink}
              tilt={botTilt}
              opacity={t >= 0.4 ? 1 : 0}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                left: cur.x,
                top: cur.y + hover,
                opacity: Math.min(1, curIn * 3),
                transform: `scale(${curIn})`,
                transformOrigin: "0 0",
              }}
            >
              <CursorIcon size={92} />
            </div>
          )}
        </div>
      </div>

      {/* ---------------- overlays that do not move with the camera ---------------- */}
      {/* soft band so the step pills sit on a clean strip instead of on page content */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 410,
          backgroundImage:
            "linear-gradient(180deg, rgba(228, 223, 255, 0.97) 0%, rgba(228, 223, 255, 0.97) 84%, rgba(228, 223, 255, 0) 100%)",
          opacity: prog(t, stepStart - 0.05, stepStart + 0.25),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - 450,
          right: 1080 - cx - 450,
          top: 276,
          display: "flex",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {steps.map((label, i) => {
          const s = bounce(t, stepStart + i * 0.07, fps);
          const active = step === i && t >= stepTimes[0];
          const done = step > i;
          const hit = 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 22px 8px 10px",
                borderRadius: 999,
                backgroundImage: active ? NJ.grad : "none",
                backgroundColor: active ? "transparent" : NJ.paper,
                boxShadow: active ? NJ.glow : "0 10px 22px -8px rgba(15, 23, 42, 0.4)",
                opacity: Math.min(1, s * 4),
                transform: `translateY(${(1 - Math.min(1, s)) * -30}px) scale(${s * (i === 0 ? 1 : hit)})`,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: active ? "#FFFFFF" : done ? NJ.okBg : NJ.chipBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: NJ.font,
                  fontWeight: 700,
                  fontSize: 28,
                  lineHeight: 1,
                  color: active ? NJ.deep : NJ.chipInk,
                  flexShrink: 0,
                }}
              >
                {done ? <CheckIcon size={28} color={NJ.ok} stroke={4.2} /> : i + 1}
              </div>
              <div
                style={{
                  fontFamily: NJ.font,
                  fontWeight: 900,
                  fontSize: 36,
                  lineHeight: 1.2,
                  color: active ? "#FFFFFF" : done ? NJ.ink : NJ.muted,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: cx - 450,
          right: 1080 - cx - 450,
          top: TARGET.y - 70,
          height: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: Math.min(1, badgeIn * 4, badgeOut * 4),
          transform: `scale(${badgeIn * badgeBump * badgeOut})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "20px 54px 24px 32px",
            borderRadius: 999,
            backgroundImage: NJ.grad,
            boxShadow: "0 30px 60px -18px rgba(91, 84, 232, 0.9)",
          }}
        >
          <div style={{ transform: `rotate(${Math.sin(t * 4) * 12}deg)` }}>
            <StarIcon size={84} color="#FFFFFF" />
          </div>
          <div
            style={{
              fontFamily: NJ.font,
              fontWeight: 700,
              fontSize: 90,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {p.badge}
          </div>
        </div>
      </div>
    </div>
  );
}
