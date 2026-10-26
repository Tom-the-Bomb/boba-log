"use client";

import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

/** How long a still finger waits before naming what it is on. */
const PREVIEW_DELAY_MS = 100;
/** A sideways slide this long names it straight away. */
const SLIDE_PX = 6;

interface TouchScrubOptions<T> {
  /** The value under a point on screen, or null where there is none. */
  pick: (x: number, y: number) => T | null;
  /** Shows the value under the finger, or hides the preview with null. */
  onPreview: (value: T | null, x: number, y: number) => void;
  onCommit: (value: T) => void;
}

/**
 * Picks a value from a chart too dense to tap precisely: a finger slides
 * along it while the value under it is previewed, and lifting the finger
 * commits it. Mice and pens are left to hover and click as usual.
 *
 * The element needs `touch-action: pan-y` so a vertical swipe still scrolls
 * the page; the browser then cancels the touch and nothing is picked.
 */
export default function useTouchScrub<T>({
  pick,
  onPreview,
  onCommit,
}: TouchScrubOptions<T>) {
  const scrub = useRef<{
    pointerId: number;
    startX: number;
    value: T | null;
    shown: boolean;
    timer: number;
  } | null>(null);
  // A lifted finger also fires a click on whatever it first touched; the
  // release has already picked, so that click is dropped.
  const committedAt = useRef(-Infinity);

  useEffect(() => () => window.clearTimeout(scrub.current?.timer), []);

  function end(x: number, y: number) {
    window.clearTimeout(scrub.current?.timer);
    scrub.current = null;
    onPreview(null, x, y);
  }

  return {
    onPointerDown(event: PointerEvent) {
      if (event.pointerType !== "touch" || scrub.current) {
        return;
      }
      const { clientX: x, clientY: y } = event;
      const current = {
        pointerId: event.pointerId,
        startX: x,
        value: pick(x, y),
        shown: false,
        timer: 0,
      };
      // Waiting a moment keeps a swipe that only passes over the chart
      // from flashing a label.
      current.timer = window.setTimeout(() => {
        current.shown = true;
        onPreview(current.value, x, y);
      }, PREVIEW_DELAY_MS);
      scrub.current = current;
    },
    onPointerMove(event: PointerEvent) {
      const current = scrub.current;
      if (current?.pointerId !== event.pointerId) {
        return;
      }
      const { clientX: x, clientY: y } = event;
      current.value = pick(x, y) ?? current.value;
      if (!current.shown && Math.abs(x - current.startX) > SLIDE_PX) {
        window.clearTimeout(current.timer);
        current.shown = true;
      }
      if (current.shown) {
        onPreview(current.value, x, y);
      }
    },
    onPointerUp(event: PointerEvent) {
      const current = scrub.current;
      if (current?.pointerId !== event.pointerId) {
        return;
      }
      end(event.clientX, event.clientY);
      if (current.value !== null) {
        committedAt.current = event.timeStamp;
        onCommit(current.value);
      }
    },
    onPointerCancel(event: PointerEvent) {
      if (scrub.current?.pointerId === event.pointerId) {
        end(event.clientX, event.clientY);
      }
    },
    onClickCapture(event: MouseEvent) {
      if (event.timeStamp - committedAt.current < 1000) {
        committedAt.current = -Infinity;
        event.preventDefault();
        event.stopPropagation();
      }
    },
  };
}
