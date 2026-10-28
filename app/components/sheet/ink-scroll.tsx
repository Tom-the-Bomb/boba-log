"use client";

import { dayFromParts, daysInMonth, monthName } from "@/lib/date";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useTouchScrub from "../../hooks/use-touch-scrub";

const DEFAULT_WIDTH = 760;
const BASE = 150;
const NEAR_HEIGHT = 92;
const FAR_HEIGHT = 74;
const FAR_LIFT = 26;

interface InkScrollProps {
  year: number;
  counts: ReadonlyMap<string, number>;
  today: string;
  label: string;
  todayLabel: string;
  onSelectDay: (day: string) => void;
  tileLabel: (day: string, count: number) => string;
  levelOf?: (value: number) => number;
}

function xAt(index: number, total: number, width: number) {
  return (index / (total - 1)) * width;
}

function smoothCurve(points: readonly (readonly [number, number])[]) {
  const sampled = points.filter(
    (_, index) => index % 3 === 0 || index === points.length - 1,
  );
  let d = `M${sampled[0][0].toFixed(1)} ${sampled[0][1].toFixed(1)}`;
  for (let i = 0; i < sampled.length - 1; i++) {
    const p0 = sampled[i - 1] ?? sampled[i];
    const p1 = sampled[i];
    const p2 = sampled[i + 1];
    const p3 = sampled[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function gaussianSmooth(values: readonly number[], sigma: number) {
  const reach = Math.ceil(sigma * 3);
  return values.map((_, index) => {
    let sum = 0;
    let weight = 0;
    for (
      let j = Math.max(0, index - reach);
      j <= Math.min(values.length - 1, index + reach);
      j++
    ) {
      const k = Math.exp(-((index - j) ** 2) / (2 * sigma * sigma));
      sum += k * values[j];
      weight += k;
    }
    return weight ? sum / weight : 0;
  });
}

export default function InkScroll({
  year,
  counts,
  today,
  label,
  todayLabel,
  onSelectDay,
  tileLabel,
  levelOf = (value) => Math.min(value, 4),
}: InkScrollProps) {
  const { i18n } = useTranslation();
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) {
      return;
    }
    const measure = () => setWidth(Math.max(1, Math.round(box.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const { days, values, lastIndex, monthStarts } = useMemo(() => {
    const list: string[] = [];
    const starts: number[] = [];
    for (let month = 0; month < 12; month++) {
      starts.push(list.length);
      for (let date = 1; date <= daysInMonth(year, month); date++) {
        list.push(dayFromParts(year, month, date));
      }
    }
    const last = list.findLastIndex((day) => day <= today);
    return {
      days: list,
      values: list.map((day, index) =>
        index <= last ? (counts.get(day) ?? 0) : 0,
      ),
      lastIndex: last,
      monthStarts: starts,
    };
  }, [year, counts, today]);

  const x = (index: number) => xAt(index, days.length, width);
  const monthStep = width / 12 < 44 ? 2 : 1;

  const ridges = useMemo(() => {
    if (lastIndex < 1) {
      return null;
    }
    const painted = values.slice(0, lastIndex + 1);
    const near = gaussianSmooth(painted, 5);
    const far = gaussianSmooth(painted, 12);
    const peak = Math.max(1, ...near);
    const px = (index: number) => xAt(index, values.length, width);
    const toPoints = (series: number[], height: number, lift: number) =>
      series.map(
        (value, index) =>
          [px(index), BASE - lift - (value / peak) * height] as const,
      );
    const nearLine = smoothCurve(toPoints(near, NEAR_HEIGHT, 0));
    const farLine = smoothCurve(toPoints(far, FAR_HEIGHT, FAR_LIFT));
    const foot = ` L${px(lastIndex).toFixed(1)} ${BASE} L0 ${BASE} Z`;
    return {
      far: farLine + foot,
      near: nearLine + foot,
      farLine,
      nearLine,
    };
  }, [values, lastIndex, width]);

  function indexAt(clientX: number) {
    const box = boxRef.current!.getBoundingClientRect();
    const ratio = (clientX - box.left) / box.width;
    const index = Math.round(ratio * (days.length - 1));
    return Math.max(0, Math.min(lastIndex, index));
  }

  const scrub = useTouchScrub({
    pick: (clientX) => (lastIndex >= 0 ? indexAt(clientX) : null),
    onPreview: (index) => setHover(index),
    onCommit: (index) => onSelectDay(days[index]),
  });

  const hoverDay = hover !== null ? days[hover] : null;
  const todayX = lastIndex >= 0 ? x(lastIndex) : null;
  const isCurrentYear = today.startsWith(`${year}-`);

  return (
    <div ref={boxRef} className="h-full">
      <svg
        viewBox={`0 0 ${width} ${BASE + 52}`}
        className="h-full w-full cursor-pointer touch-pan-y touch-pinch-zoom overflow-visible text-ink"
        role="img"
        aria-label={label}
        onPointerDown={scrub.onPointerDown}
        onPointerMove={(event) => {
          if (event.pointerType === "touch") {
            scrub.onPointerMove(event);
          } else if (lastIndex >= 0) {
            setHover(indexAt(event.clientX));
          }
        }}
        onPointerUp={scrub.onPointerUp}
        onPointerCancel={scrub.onPointerCancel}
        onPointerLeave={() => setHover(null)}
        onClickCapture={scrub.onClickCapture}
        onClick={(event) => {
          if (lastIndex >= 0) {
            onSelectDay(days[indexAt(event.clientX)]);
          }
        }}
      >
        <defs>
          <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.24" />
            <stop offset="0.6" stopColor="currentColor" stopOpacity="0.06" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.48" />
            <stop offset="0.45" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id={`${id}-mist-fade`}
            gradientUnits="userSpaceOnUse"
            x1={Math.max(0, (todayX ?? width) - 70)}
            x2={todayX ?? width}
          >
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
          </linearGradient>
          <mask id={`${id}-mist`}>
            <rect
              width={width}
              height={BASE + 2}
              fill={`url(#${id}-mist-fade)`}
            />
          </mask>
        </defs>

        {ridges && (
          <g mask={`url(#${id}-mist)`}>
            <path d={ridges.far} fill={`url(#${id}-far)`} />
            <path d={ridges.near} fill={`url(#${id}-near)`} />
            <path
              d={ridges.farLine}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
            />
            <path
              d={ridges.nearLine}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        )}

        <line
          x1={todayX ?? 0}
          x2={width}
          y1={BASE}
          y2={BASE}
          stroke="var(--rule-strong)"
          strokeDasharray="1 5"
        />
        {todayX !== null && (
          <line
            x1="0"
            x2={todayX}
            y1={BASE}
            y2={BASE}
            stroke="currentColor"
            strokeOpacity="0.25"
          />
        )}

        {values.map((value, index) =>
          value > 0 ? (
            <circle
              key={days[index]}
              cx={x(index)}
              cy={BASE + 12}
              r={Math.min(
                0.62 + levelOf(value) * 0.07,
                (width / days.length) * 0.6,
              )}
              fill="currentColor"
              opacity={0.3 + levelOf(value) * 0.16}
            />
          ) : null,
        )}

        {monthStarts.map((start, month) =>
          month % monthStep ? null : (
            <text
              key={month}
              x={x(start) + 2}
              y={BASE + 36}
              fontSize="12"
              fill="var(--text-2)"
              className="font-kai"
            >
              {monthName(month, i18n.language)}
            </text>
          ),
        )}

        {isCurrentYear && todayX !== null && (
          <g aria-hidden="true">
            <line
              x1={todayX}
              x2={todayX}
              y1={BASE - NEAR_HEIGHT - 18}
              y2={BASE + 12}
              stroke="var(--seal)"
              strokeOpacity="0.75"
              strokeDasharray="2 3"
            />
            <text
              x={todayX}
              y={BASE - NEAR_HEIGHT - 24}
              textAnchor="middle"
              fontSize="12"
              fill="var(--text-2)"
              className="font-kai"
            >
              {todayLabel}
            </text>
          </g>
        )}

        {hover !== null && hoverDay && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={20}
              y2={BASE + 16}
              stroke="currentColor"
              strokeOpacity="0.35"
            />
            <text
              x={Math.min(Math.max(x(hover), 70), width - 70)}
              y="14"
              textAnchor="middle"
              fontSize="13"
              fill="currentColor"
              className="font-kai"
            >
              {tileLabel(hoverDay, values[hover])}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
