import type { VenueDateResponse, VenueResponse } from "./venueApi";

const API_BASE = "http://localhost:8080/api";

interface ApiErrorBody {
    message?: string;
    error?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
            const body: ApiErrorBody = await res.json();
            message = body.message ?? body.error ?? message;
        } catch {
            // not JSON, fall back to generic message
        }
        throw new Error(message);
    }
    if (res.status === 204) {
        return undefined as T;
    }
    return res.json();
}

export async function getAllVenues(): Promise<VenueResponse[]> {
    const res = await fetch(`${API_BASE}/venues`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<VenueResponse[]>(res);
}

export async function getVenueDates(venueId: number): Promise<VenueDateResponse[]> {
    const res = await fetch(`${API_BASE}/venues/${venueId}/dates`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<VenueDateResponse[]>(res);
}

export async function bookDate(eventId: number): Promise<VenueDateResponse> {
    const res = await fetch(`${API_BASE}/artists/me/bookings/${eventId}`, {
        method: "POST",
        credentials: "include",
    });
    return handleResponse<VenueDateResponse>(res);
}