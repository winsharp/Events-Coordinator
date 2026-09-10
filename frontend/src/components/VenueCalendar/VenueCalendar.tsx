import { useState } from "react";
import type { VenueDateResponse } from "../../api/venueApi";
import "./VenueCalendar.css";

interface VenueCalendarProps {
    dates: VenueDateResponse[];
    mode: "manage" | "book";
    onAddDate?: (isoDate: string) => void;
    onRemoveDate?: (id: number) => void;
    onBookDate?: (id: number) => void;
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function VenueCalendar({
                                          dates,
                                          mode,
                                          onAddDate,
                                          onRemoveDate,
                                          onBookDate,
                                      }: VenueCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateMap = new Map(dates.map((d) => [d.eventDate, d]));
    const today = toIsoDate(new Date());

    const cells: (number | null)[] = [
        ...Array(startWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    function handleDayClick(day: number) {
        const iso = toIsoDate(new Date(year, month, day));
        const existing = dateMap.get(iso);

        if (mode === "manage") {
            if (!existing) {
                if (iso < today) return;
                onAddDate?.(iso);
            } else if (existing.status === "OPEN") {
                onRemoveDate?.(existing.id);
            }
            return;
        }

        // book mode: only OPEN days are clickable, and clicking books them
        if (existing && existing.status === "OPEN") {
            onBookDate?.(existing.id);
        }
    }

    return (
        <div className="venue-calendar">
            <div className="venue-calendar-header">
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
                <span>{viewDate.toLocaleString("default", { month: "long", year: "numeric" })}</span>
                <button onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
            </div>

            <div className="venue-calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="venue-calendar-weekday">{d}</div>
                ))}

                {cells.map((day, idx) => {
                    if (day === null) return <div key={idx} className="venue-calendar-cell empty" />;

                    const iso = toIsoDate(new Date(year, month, day));
                    const entry = dateMap.get(iso);
                    const isPast = iso < today;

                    let statusClass = "";
                    let isDisabled: boolean;

                    if (mode === "manage") {
                        statusClass = entry ? entry.status.toLowerCase() : isPast ? "past" : "";
                        isDisabled = entry?.status === "BOOKED" || (isPast && !entry);
                    } else {
                        statusClass = entry?.status === "OPEN" ? "open bookable" : "unavailable";
                        isDisabled = entry?.status !== "OPEN";
                    }

                    return (
                        <button
                            key={idx}
                            className={`venue-calendar-cell ${statusClass}`}
                            disabled={isDisabled}
                            onClick={() => handleDayClick(day)}
                            title={
                                mode === "manage" && entry?.status === "BOOKED"
                                    ? `Booked: ${entry.artistStageName}`
                                    : mode === "book" && entry?.status === "OPEN"
                                        ? "Click to book this date"
                                        : undefined
                            }
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="venue-calendar-legend">
                {mode === "manage" ? (
                    <>
                        <span className="legend-item open">Open</span>
                        <span className="legend-item booked">Booked</span>
                        <span className="legend-item">Click a day to add/remove availability</span>
                    </>
                ) : (
                    <span className="legend-item open">Click a highlighted day to book it</span>
                )}
            </div>
        </div>
    );
}