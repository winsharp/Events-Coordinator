import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVenues } from "../../api/artistApi";
import type { VenueResponse } from "../../api/venueApi";
import "./VenueListPage.css";

export default function VenueListPage() {
    const [venues, setVenues] = useState<VenueResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAllVenues();
            setVenues(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load venues");
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <p className="venue-list-status">Loading venues…</p>;
    if (error) return <p className="venue-list-status venue-list-error">{error}</p>;

    return (
        <div className="venue-list-page">
            <h1>Venues</h1>
            <div className="venue-list-grid">
                {venues.map((venue) => (
                    <button
                        key={venue.id}
                        className="venue-list-card"
                        onClick={() => navigate(`/venues/${venue.id}`)}
                    >
                        <p className="venue-list-name">{venue.name}</p>
                        <p className="venue-list-city">{venue.city}</p>
                        <p className="venue-list-capacity">Capacity: {venue.capacity}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}