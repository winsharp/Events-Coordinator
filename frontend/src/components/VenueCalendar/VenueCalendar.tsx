import { useState } from "react";
import type { VenueDateResponse } from "../../api/venueApi";
import "./VenueCalendar.css";

interface VenueCalendarProps {
    dates: VenueDateResponse[];
    onAddDate: (isoDate: string) => void;
    onRemoveDate: (id: number) => void;
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function VenueCalendar({ dates, onAddDate, onRemoveDate }: VenueCalendarProps) {
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

        if (!existing) {
            if (iso < today) return; // ignore clicks on past dates
            onAddDate(iso);
        } else if (existing.status === "OPEN") {
            onRemoveDate(existing.id);
        }
        // BOOKED dates are not clickable — handled via CSS below
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
                    const statusClass = entry ? entry.status.toLowerCase() : isPast ? "past" : "";

                    return (
                        <button
                            key={idx}
                            className={`venue-calendar-cell ${statusClass}`}
                            disabled={entry?.status === "BOOKED" || (isPast && !entry)}
                            onClick={() => handleDayClick(day)}
                            title={entry?.status === "BOOKED" ? `Booked: ${entry.artistStageName}` : undefined}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="venue-calendar-legend">
                <span className="legend-item open">Open</span>
                <span className="legend-item booked">Booked</span>
                <span className="legend-item">Click a day to add/remove availability</span>
            </div>
        </div>
    );
}