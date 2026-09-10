import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VenueCalendar from "../../components/VenueCalendar/VenueCalendar";
import { bookDate, getVenueDates } from "../../api/artistApi";
import type { VenueDateResponse } from "../../api/venueApi";
import "./VenueBookingPage.css";

export default function VenueBookingPage() {
    const { venueId } = useParams<{ venueId: string }>();
    const [dates, setDates] = useState<VenueDateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (venueId) load(Number(venueId));
    }, [venueId]);

    async function load(id: number) {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getVenueDates(id);
            setDates(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load available dates");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleBookDate(eventId: number) {
        setError(null);
        setSuccessMessage(null);
        try {
            const booked = await bookDate(eventId);
            setDates((prev) => prev.filter((d) => d.id !== booked.id));
            setSuccessMessage(`Booked ${booked.eventDate}!`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to book this date");
        }
    }

    return (
        <div className="venue-booking-page">
            <h1>Available Dates</h1>

            {error && <div className="venue-booking-error">{error}</div>}
            {successMessage && <div className="venue-booking-success">{successMessage}</div>}

            {isLoading ? (
                <p>Loading availability…</p>
            ) : (
                <div className="venue-calendar-card">
                    <VenueCalendar dates={dates} mode="book" onBookDate={handleBookDate} />
                </div>
            )}
        </div>
    );
}