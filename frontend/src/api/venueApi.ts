const API_BASE = "http://localhost:8080/api";

export type DateStatus = "OPEN" | "BOOKED";

export interface VenueDateResponse {
    id: number;
    eventDate: string; // "YYYY-MM-DD"
    status: DateStatus;
    artistStageName: string | null;
}

interface ApiErrorBody {
    message?: string;
    error?: string;
}

export interface VenueResponse {
    id: number;
    username: string;
    name: string;
    city: string;
    capacity: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
            const body: ApiErrorBody = await res.json();
            message = body.message ?? body.error ?? message;
        } catch {
            // response wasn't JSON — fall back to the generic message
        }
        throw new Error(message);
    }
    if (res.status === 204) {
        return undefined as T;
    }
    return res.json();
}

export async function getMyVenueProfile(): Promise<VenueResponse> {
    const res = await fetch(`${API_BASE}/venues/me`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse<VenueResponse>(res);
}

export async function getMyDates(): Promise<VenueDateResponse[]> {
    const res = await fetch(`${API_BASE}/venues/me/dates`, {
        method: "GET",
        credentials: "include", // sends the JSESSIONID cookie
    });
    return handleResponse<VenueDateResponse[]>(res);
}

export async function addDate(eventDate: string): Promise<VenueDateResponse> {
    const res = await fetch(`${API_BASE}/venues/me/dates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDate }),
    });
    return handleResponse<VenueDateResponse>(res);
}

export async function deleteDate(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/venues/me/dates/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<void>(res);
}