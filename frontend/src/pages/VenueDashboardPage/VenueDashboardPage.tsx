import { useEffect, useState } from "react";
import VenueCalendar from "../../components/VenueCalendar/VenueCalendar";
import { addDate, deleteDate, getMyDates, type VenueDateResponse } from "../../api/venueApi";
import "./VenueDashboardPage.css";

export default function VenueDashboardPage() {
    const [dates, setDates] = useState<VenueDateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDates();
    }, []);

    async function loadDates() {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getMyDates();
            setDates(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dates");
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
            {/* TODO: replace with real venue name once a venue-profile endpoint (GET /api/venues/me) is confirmed */}
            <h1>Manage Availability</h1>
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