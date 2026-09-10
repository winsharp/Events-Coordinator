const API_BASE = "http://localhost:8080/api";

export interface CustomerResponse {
    id: number;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
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

export async function getMyCustomerProfile(): Promise<CustomerResponse> {
    const res = await fetch(`${API_BASE}/customers/me`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse<CustomerResponse>(res);
}
