"use client";

import { useMemo, useState } from "react";
import { AvailabilitySlot, DAYS, Day } from "@/lib/types";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 - 23:00

function slotsToKeys(slots: AvailabilitySlot[]): Set<string> {
  const keys = new Set<string>();
  for (const slot of slots) {
    for (let h = slot.start; h < slot.end; h++) {
      keys.add(`${slot.day}-${h}`);
    }
  }
  return keys;
}

function keysToSlots(keys: Set<string>): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  for (const day of DAYS) {
    const hours = HOURS.filter((h) => keys.has(`${day}-${h}`)).sort((a, b) => a - b);
    let start: number | null = null;
    let prev: number | null = null;
    for (const h of hours) {
      if (start === null) {
        start = h;
      } else if (prev !== null && h !== prev + 1) {
        slots.push({ day, start, end: prev + 1 });
        start = h;
      }
      prev = h;
    }
    if (start !== null && prev !== null) {
      slots.push({ day, start, end: prev + 1 });
    }
  }
  return slots;
}

function formatHour(h: number) {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${period}`;
}

export default function AvailabilityPlanner({
  initialSlots,
  onSave,
}: {
  initialSlots: AvailabilitySlot[];
  onSave: (slots: AvailabilitySlot[]) => void | Promise<void>;
}) {
  const [keys, setKeys] = useState<Set<string>>(() => slotsToKeys(initialSlots));
  const [painting, setPainting] = useState<{ value: boolean } | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotCount = useMemo(() => keysToSlots(keys).length, [keys]);

  function toggleCell(day: Day, hour: number, forceValue?: boolean) {
    const key = `${day}-${hour}`;
    setKeys((prev) => {
      const next = new Set(prev);
      const value = forceValue ?? !next.has(key);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
    setSaved(false);
  }

  function handleMouseDown(day: Day, hour: number) {
    const key = `${day}-${hour}`;
    const newValue = !keys.has(key);
    setPainting({ value: newValue });
    toggleCell(day, hour, newValue);
  }

  function handleMouseEnter(day: Day, hour: number) {
    if (!painting) return;
    toggleCell(day, hour, painting.value);
  }

  return (
    <div onMouseUp={() => setPainting(null)} onMouseLeave={() => setPainting(null)}>
      <p className="mb-3 text-sm text-slate-500">
        Click or click-and-drag to mark the hours you&apos;re free to work. Jobs matching your
        availability will be highlighted in search.
      </p>
      <div className="overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full select-none border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white p-2 text-left text-slate-400"></th>
              {DAYS.map((day) => (
                <th key={day} className="bg-blue-50 p-2 text-center font-semibold text-blue-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="sticky left-0 z-10 whitespace-nowrap bg-white p-2 text-right text-slate-400">
                  {formatHour(hour)}
                </td>
                {DAYS.map((day) => {
                  const active = keys.has(`${day}-${hour}`);
                  return (
                    <td
                      key={day}
                      data-testid={`slot-${day}-${hour}`}
                      onMouseDown={() => handleMouseDown(day, hour)}
                      onMouseEnter={() => handleMouseEnter(day, hour)}
                      className={`h-6 w-10 cursor-pointer border border-blue-50 transition-colors ${
                        active ? "bg-blue-600" : "bg-white hover:bg-blue-100"
                      }`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          data-testid="save-availability"
          disabled={saving}
          onClick={async () => {
            setError(null);
            setSaving(true);
            try {
              await onSave(keysToSlots(keys));
              setSaved(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to save");
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : `Save availability (${slotCount} block${slotCount === 1 ? "" : "s"})`}
        </button>
        <button
          type="button"
          onClick={() => {
            setKeys(new Set());
            setSaved(false);
          }}
          className="rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          Clear all
        </button>
        {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
        {error && <span className="text-sm font-medium text-red-600">{error}</span>}
      </div>
    </div>
  );
}
