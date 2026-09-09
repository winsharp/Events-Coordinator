import { useEffect, useState } from "react";
import VenueCalendar from "../../components/VenueCalendar/VenueCalendar";
import {
    addDate,
    deleteDate,
    getMyDates,
    getMyVenueProfile,
    type VenueDateResponse,
    type VenueResponse,
} from "../../api/venueApi";
import "./VenueDashboardPage.css";

export default function VenueDashboardPage() {
    const [venue, setVenue] = useState<VenueResponse | null>(null);
    const [dates, setDates] = useState<VenueDateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        setIsLoading(true);
        setError(null);
        try {
            const [venueResult, datesResult] = await Promise.all([
                getMyVenueProfile(),
                getMyDates(),
            ]);
            setVenue(venueResult);
            setDates(datesResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddDate(isoDate: string) {
        setError(null);
        try {
            const created = await addDate(isoDate);
            setDates((prev) => [...prev, created]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add date");
        }
    }

    async function handleRemoveDate(id: number) {
        setError(null);
        try {
            await deleteDate(id);
            setDates((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove date");
        }
    }

    return (
        <div className="venue-dashboard-page">
            <h1>{venue ? venue.name : "Manage Availability"}</h1>
            {venue && <p className="venue-dashboard-subtitle">{venue.city}</p>}

            {error && <div className="venue-dashboard-error">{error}</div>}

            {isLoading ? (
                <p>Loading your calendar…</p>
            ) : (
                <div className="venue-calendar-card">
                    <VenueCalendar dates={dates} onAddDate={handleAddDate} onRemoveDate={handleRemoveDate} />
                </div>
            )}
        </div>
    );
}