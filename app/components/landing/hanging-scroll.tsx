"use client";

import { dayFromParts, daysInMonth, formatDay, monthName } from "@/lib/date";
import { SAMPLE, SAMPLE_YEAR } from "@/lib/sample-year";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import TeaDrop from "../sheet/tea-drop";
import styles from "./hanging-scroll.module.css";

// Positions are in scroll lengths: 0 hanging free, 1 rolled up to the stave.
const FALL_SECONDS = 0.6;
const BOUNCE = 0.14;
const GRAVITY = 2 / FALL_SECONDS ** 2;
const FRAME_MS = 1000 / 60;
const TUG_SPEED = 0.45;
const MAX_FLICK_SPEED = 5;

function fall(rolled: number, speed: number) {
  const frames = [1 - rolled];
  let y = rolled;
  let v = speed;
  let landed = false;
  for (let frame = 0; frame < 600; frame++) {
    for (let step = 0; step < 16; step++) {
      v -= GRAVITY / 960;
      y += v / 960;
      if (y >= 1) {
        y = 1;
        v = Math.min(v, 0);
      }
      if (y <= 0) {
        y = 0;
        v = -v * BOUNCE;
        landed = true;
      }
    }
    frames.push(1 - y);
    if (landed && y === 0 && v < GRAVITY / 60) {
      break;
    }
  }
  frames.push(1);
  return frames;
}

const ARRIVAL = fall(1, 0);
const ARRIVAL_STYLE = {
  "--drop-easing": `linear(${ARRIVAL.map((open) => open.toFixed(4)).join(", ")})`,
  "--drop-ms": `${Math.round((ARRIVAL.length - 1) * FRAME_MS)}ms`,
} as CSSProperties;

const CORD = "M264.5 110 L290 100 Q 392 60 500 2 Q 608 60 710 100 L735.5 110";

const HANZI_DIGITS = "〇一二三四五六七八九";
const TITLE = `${[...String(SAMPLE_YEAR)].map((digit) => HANZI_DIGITS[Number(digit)]).join("")} · 茶`;

const MONTHS = Array.from({ length: 12 }, (_, month) => {
  const days = Array.from({ length: 31 }, (_, index) =>
    index < daysInMonth(SAMPLE_YEAR, month)
      ? dayFromParts(SAMPLE_YEAR, month, index + 1)
      : null,
  );
  const total = days.reduce(
    (sum, day) => sum + (day ? (SAMPLE.counts.get(day) ?? 0) : 0),
    0,
  );
  return { month, days, total };
});

interface Tip {
  text: string;
  x: number;
  y: number;
}

function useRoller(
  rootRef: RefObject<HTMLElement | null>,
  lengthRef: RefObject<HTMLDivElement | null>,
  rollerRef: RefObject<HTMLButtonElement | null>,
  onGrab: () => void,
) {
  useEffect(() => {
    const root = rootRef.current;
    const length = lengthRef.current;
    const roller = rollerRef.current;
    if (!root || !length || !roller) {
      return;
    }
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let travel = length.offsetHeight;
    const resize = new ResizeObserver(() => {
      travel = length.offsetHeight;
      root.style.setProperty("--hs-travel", `${travel}px`);
    });
    resize.observe(length);

    const setRolled = (rolled: number) =>
      root.style.setProperty("--open", String(1 - rolled));
    const inlineRolled = () =>
      1 - parseFloat(root.style.getPropertyValue("--open"));

    function grab() {
      const open = Number(getComputedStyle(root!).getPropertyValue("--open"));
      root!.getAnimations().forEach((animation) => animation.cancel());
      const rolled = 1 - open;
      setRolled(rolled);
      return rolled;
    }

    function drop(rolled: number, speed = 0) {
      setRolled(0);
      if (reduceMotion.matches || (rolled <= 0.002 && speed <= 0)) {
        return;
      }
      const frames = fall(rolled, speed);
      root!.animate(
        frames.map((open) => ({ "--open": open })),
        { duration: (frames.length - 1) * FRAME_MS, easing: "linear" },
      );
    }

    let drag: {
      pointerId: number;
      startY: number;
      from: number;
      rolled: number;
      moved: boolean;
      trail: [number, number][];
    } | null = null;

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0 || drag) {
        return;
      }
      roller!.setPointerCapture(event.pointerId);
      root!.dataset.grabbing = "";
      onGrab();
      const from = grab();
      drag = {
        pointerId: event.pointerId,
        startY: event.clientY,
        from,
        rolled: from,
        moved: false,
        trail: [[event.timeStamp, event.clientY]],
      };
    }

    function onPointerMove(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.pointerId) {
        return;
      }
      const lifted = drag.startY - event.clientY;
      drag.moved ||= Math.abs(lifted) > 3;
      drag.rolled = Math.min(1, Math.max(0, drag.from + lifted / travel));
      setRolled(drag.rolled);
      drag.trail.push([event.timeStamp, event.clientY]);
      if (drag.trail.length > 6) {
        drag.trail.shift();
      }
    }

    function release(event?: PointerEvent) {
      if (!drag || (event && event.pointerId !== drag.pointerId)) {
        return;
      }
      delete root!.dataset.grabbing;
      const { moved, rolled, trail } = drag;
      drag = null;
      if (event?.type !== "pointerup") {
        drop(rolled);
        return;
      }
      if (!moved) {
        drop(rolled, TUG_SPEED);
        return;
      }
      const [startTime, startY] = trail[0];
      const seconds = (event.timeStamp - startTime) / 1000;
      const stillMoving = event.timeStamp - trail[trail.length - 1][0] < 80;
      const speed =
        seconds > 0.005 && stillMoving
          ? (startY - event.clientY) / seconds / travel
          : 0;
      drop(
        rolled,
        Math.max(-MAX_FLICK_SPEED, Math.min(MAX_FLICK_SPEED, speed)),
      );
    }

    let winding = false;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowUp") {
        return;
      }
      event.preventDefault();
      const rolled = winding ? inlineRolled() : grab();
      winding = true;
      setRolled(Math.min(1, rolled + 0.06));
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "ArrowUp" && winding) {
        winding = false;
        drop(inlineRolled());
      }
    }
    function onBlur() {
      release();
      if (winding) {
        winding = false;
        drop(inlineRolled());
      }
    }
    function onClick(event: MouseEvent) {
      if (event.detail === 0) {
        drop(grab(), TUG_SPEED);
      }
    }

    roller.addEventListener("pointerdown", onPointerDown);
    roller.addEventListener("pointermove", onPointerMove);
    roller.addEventListener("pointerup", release);
    roller.addEventListener("pointercancel", release);
    roller.addEventListener("lostpointercapture", release);
    window.addEventListener("blur", onBlur);
    roller.addEventListener("keydown", onKeyDown);
    roller.addEventListener("keyup", onKeyUp);
    roller.addEventListener("click", onClick);
    return () => {
      resize.disconnect();
      roller.removeEventListener("pointerdown", onPointerDown);
      roller.removeEventListener("pointermove", onPointerMove);
      roller.removeEventListener("pointerup", release);
      roller.removeEventListener("pointercancel", release);
      roller.removeEventListener("lostpointercapture", release);
      window.removeEventListener("blur", onBlur);
      roller.removeEventListener("keydown", onKeyDown);
      roller.removeEventListener("keyup", onKeyUp);
      roller.removeEventListener("click", onClick);
    };
  }, [rootRef, lengthRef, rollerRef, onGrab]);
}

function Cord() {
  return (
    <svg
      aria-hidden="true"
      className={styles.cord}
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
    >
      <path
        d={CORD}
        fill="none"
        stroke="rgb(0 0 0 / 0.18)"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        transform="translate(4 6)"
      />
      <path
        d={CORD}
        fill="none"
        stroke="var(--hs-cord)"
        strokeWidth="2.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={CORD}
        fill="none"
        stroke="var(--hs-cord-hi)"
        strokeWidth="1"
        strokeDasharray="1.6 2.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function HangingScroll({ className = "" }) {
  const { t, i18n } = useTranslation("landing");
  const { t: td } = useTranslation("dashboard");
  const rootRef = useRef<HTMLElement>(null);
  const lengthRef = useRef<HTMLDivElement>(null);
  const rollerRef = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const hideTip = useCallback(() => setTip(null), []);

  useRoller(rootRef, lengthRef, rollerRef, hideTip);

  function showTip(event: ReactPointerEvent) {
    if (rootRef.current?.dataset.grabbing !== undefined) {
      return;
    }
    const cell = (event.target as Element).closest<HTMLElement>("[data-day]");
    if (!cell) {
      setTip(null);
      return;
    }
    const day = cell.dataset.day!;
    const count = SAMPLE.counts.get(day) ?? 0;
    const date = formatDay(day, i18n.language, {
      month: "short",
      day: "numeric",
    });
    const rect = cell.getBoundingClientRect();
    setTip({
      text:
        count > 0
          ? td("tileLabel", { date, count })
          : td("tileLabelNone", { date }),
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  return (
    <figure
      ref={rootRef}
      aria-label={t("sampleLabel")}
      className={`${styles.scroll} ${className}`}
      style={ARRIVAL_STYLE}
    >
      <i aria-hidden="true" className={styles.nail} />
      <div className={styles.hang}>
        <div aria-hidden="true" className={styles.wallShadow} />
        <Cord />
        <div aria-hidden="true" className={styles.stave} />
        <div ref={lengthRef} className={styles.length}>
          <div className={styles.silk}>
            <div aria-hidden="true" className={styles.tian}>
              <i className={`${styles.ribbon} left-[34%]`} />
              <i className={`${styles.ribbon} left-[66%]`} />
            </div>
            <div className={styles.paperWrap}>
              <div className={styles.paper}>
                <p aria-hidden="true" className={`${styles.title} font-kai`}>
                  {TITLE}
                </p>
                <div
                  aria-hidden="true"
                  onPointerOver={showTip}
                  onPointerLeave={() => setTip(null)}
                >
                  {MONTHS.map(({ month, days, total }) => (
                    <div key={month} className={styles.month}>
                      <span className={styles.monthName}>
                        {monthName(month, i18n.language)}
                      </span>
                      <div className={styles.days}>
                        {days.map((day, index) => {
                          const count = day ? (SAMPLE.counts.get(day) ?? 0) : 0;
                          return (
                            <span
                              key={index}
                              className={styles.day}
                              data-day={day ?? undefined}
                            >
                              {day &&
                                (count > 0 ? (
                                  <TeaDrop count={count} showCount={false} />
                                ) : (
                                  <i className={styles.empty} />
                                ))}
                            </span>
                          );
                        })}
                      </div>
                      <span className={`${styles.monthTotal} tabular-nums`}>
                        {total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.di} />
          </div>
          <button
            ref={rollerRef}
            type="button"
            aria-label={t("scrollRoller")}
            className={styles.roller}
          >
            <i className={`${styles.knob} ${styles.knobStart}`} />
            <i className={`${styles.knob} ${styles.knobEnd}`} />
          </button>
        </div>
      </div>
      {tip && (
        <div
          aria-hidden="true"
          className={`${styles.tip} font-kai`}
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      )}
    </figure>
  );
}
