
const API_BASE_URL = "http://localhost:8080";

export type BackendRole = "CUSTOMER" | "ARTIST" | "VENUE";

export interface AuthResponse {
  id: number;
  username: string;
  role: BackendRole;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: BackendRole;
  firstName: string;
  lastName: string;
}

async function getErrorMessage(
  response: Response,
  defaultMessage: string
): Promise<string> {
  if (response.status === 401) {
    return "Invalid username or password";
  }

  try {
    const data = await response.json();

    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;
  } catch {
    // Response did not contain JSON.
  }

  return defaultMessage;
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Unable to sign in."
    );

    throw new Error(message);
  }

  return response.json();
}

export async function register(
  data: RegisterRequest
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Unable to create your account."
    );

    throw new Error(message);
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to log out.");
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Not authenticated.");
  }

  return response.json();
}
