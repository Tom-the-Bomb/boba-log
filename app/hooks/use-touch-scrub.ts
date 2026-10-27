"use client";

import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

const PREVIEW_DELAY_MS = 100;
const SLIDE_PX = 6;

interface TouchScrubOptions<T> {
  pick: (x: number, y: number) => T | null;
  onPreview: (value: T | null, x: number, y: number) => void;
  onCommit: (value: T) => void;
}

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
  // The release already committed, so the click a lifted finger fires is dropped.
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
