const API_BASE = "http://localhost:8080/api";

export interface TicketResponse {
    id: number;
    eventId: number;
    eventTitle: string | null;
    artistStageName: string | null;
    venueName: string;
    eventDate: string; // "YYYY-MM-DD"
    purchasedAt: string; // ISO datetime
}

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
    return res.json();
}

export async function getMyTickets(): Promise<TicketResponse[]> {
    const res = await fetch(`${API_BASE}/tickets/me`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse<TicketResponse[]>(res);
}
