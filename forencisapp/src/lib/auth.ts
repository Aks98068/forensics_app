
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://edutechpro.online";

const ACCESS_TOKEN_KEY = "accessToken";

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "USER" | "ANALYST" | "ADMIN" | string;
  status?: string;
  email_verified?: boolean;
  created_at?: string;
  last_login_at?: string | null;
};

export type ApiError = Error & {
  status?: number;
};

type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthenticatedUser;
  message?: string;
  error?: string;
};

type ProfileResponse = {
  user: AuthenticatedUser;
};

function createApiError(
  message: string,
  status?: number
): ApiError {
  const error = new Error(message) as ApiError;

  error.status = status;

  return error;
}

/**
 * Retrieve the access token stored after a successful login.
 * Call this only in the browser.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Store the access token after a successful login.
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    throw new Error("Access tokens can only be stored in the browser.");
  }

  if (!token.trim()) {
    throw new Error("Cannot store an empty access token.");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Remove the locally stored access token.
 */
export function clearAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

/**
 * Make an authenticated request to the Go backend.
 *
 * The backend must validate the Bearer token.
 * This function does not bypass server-side authorization.
 */
export async function authFetch(
  path: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("API path must be a local absolute path.");
  }

  const token = getAccessToken();

  if (!token) {
    throw createApiError(
      "Your session is missing. Please log in again.",
      401
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    clearAccessToken();

    if (typeof window !== "undefined") {
      const currentPath =
        window.location.pathname + window.location.search;

      if (window.location.pathname !== "/login") {
        const returnTo = encodeURIComponent(currentPath);

        window.location.replace(`/login?returnTo=${returnTo}`);
      }
    }

    throw createApiError(
      "Your session is invalid or expired. Please log in again.",
      401
    );
  }

  return response;
}

/**
 * Parse a JSON API response and report HTTP errors.
 */
export async function authJson<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await authFetch(path, options);

  if (!response.ok) {
    let message = `Request failed with HTTP ${response.status}.`;

    try {
      const data = await response.clone().json();

      if (typeof data?.error === "string") {
        message = data.error;
      } else if (typeof data?.message === "string") {
        message = data.message;
      }
    } catch {
      // Keep the HTTP status message if the response is not JSON.
    }

    throw createApiError(message, response.status);
  }

  return (await response.json()) as T;
}

/**
 * Retrieve the currently authenticated user's profile.
 *
 * Backend endpoint:
 * GET /api/v1/protected/user/me
 */
export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const data = await authJson<ProfileResponse>(
    "/api/v1/protected/user/me",
    {
      method: "GET",
    }
  );

  if (!data?.user) {
    throw new Error("The server did not return a user profile.");
  }

  return data.user;
}

/**
 * Log in using an email address or username.
 */
export async function login(
  identifier: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      identifier: identifier.trim(),
      password,
    }),
  });

  let data: LoginResponse;

  try {
    data = (await response.json()) as LoginResponse;
  } catch {
    throw createApiError(
      "The server returned an invalid login response.",
      response.status
    );
  }

  if (!response.ok) {
    throw createApiError(
      data.error || data.message || "Login failed.",
      response.status
    );
  }

  if (!data.accessToken) {
    throw new Error(
      "Login succeeded without returning an access token."
    );
  }

  setAccessToken(data.accessToken);

  return data;
}

/**
 * Log out through the Go backend, then clear the local token.
 */
export async function logout(): Promise<void> {
  try {
    const token = getAccessToken();

    if (token) {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        cache: "no-store",
      });
    }
  } finally {
    clearAccessToken();

    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }
}
