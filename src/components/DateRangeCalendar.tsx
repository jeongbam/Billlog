"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

function toIso(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * Inline calendar day-picker for choosing a start~end date range.
 * Dates before today are disabled. First tap sets the start date, second
 * tap sets the end date (tapping a date before the current start restarts
 * the selection from that date).
 */
export function DateRangeCalendar({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}) {
  const today = startOfToday();
  const initial = startDate ? new Date(`${startDate}T00:00:00`) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const isPast = (iso: string) => new Date(`${iso}T00:00:00`) < today;

  function goPrevMonth() {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    // Don't let the picker navigate to a month fully in the past.
    if (
      prev.getFullYear() < today.getFullYear() ||
      (prev.getFullYear() === today.getFullYear() &&
        prev.getMonth() < today.getMonth())
    ) {
      return;
    }
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
  }

  function goNextMonth() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function handlePick(iso: string) {
    if (isPast(iso)) return;
    if (!startDate || (startDate && endDate)) {
      // Nothing selected yet, or a full range already selected -> start fresh.
      onChange(iso, "");
      return;
    }
    // Only startDate is set.
    if (iso < startDate) {
      onChange(iso, "");
    } else {
      onChange(startDate, iso);
    }
  }

  const cells: { day: number; iso: string }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: toIso(viewYear, viewMonth, d) });
  }

  const prevDisabled =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="border-[1.4px] border-gray-200 rounded-xl p-3.5 bg-white">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrevMonth}
          disabled={prevDisabled}
          className="w-8 h-8 flex items-center justify-center text-gray-500 disabled:opacity-25"
          aria-label="이전 달"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <div className="text-[18px] font-bold text-gray-800">
          {viewYear}년 {viewMonth + 1}월
        </div>
        <button
          type="button"
          onClick={goNextMonth}
          className="w-8 h-8 flex items-center justify-center text-gray-500"
          aria-label="다음 달"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cx(
              "text-center text-[13px] font-semibold py-1",
              i === 0
                ? "text-error"
                : i === 6
                  ? "text-mint-400"
                  : "text-gray-400",
            )}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {cells.map(({ day, iso }) => {
          const disabled = isPast(iso);
          const isStart = iso === startDate;
          const isEnd = iso === endDate;
          const inRange =
            !!startDate && !!endDate && iso > startDate && iso < endDate;
          const isEdge = isStart || isEnd;

          return (
            <div
              key={iso}
              className="relative flex items-center justify-center"
            >
              {inRange && (
                <div className="absolute inset-y-0 left-0 right-0 bg-mint-50" />
              )}
              {isStart && endDate && (
                <div className="absolute inset-y-0 left-1/2 right-0 bg-mint-50" />
              )}
              {isEnd && startDate && (
                <div className="absolute inset-y-0 right-1/2 left-0 bg-mint-50" />
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePick(iso)}
                className={cx(
                  "relative z-10 w-9 h-9 flex items-center justify-center rounded-full text-[15px] font-semibold transition-colors",
                  disabled && "text-gray-300",
                  !disabled && !isEdge && !inRange && "text-gray-700",
                  !disabled && inRange && !isEdge && "text-mint-500",
                  isEdge && "bg-mint-300 text-white",
                )}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
