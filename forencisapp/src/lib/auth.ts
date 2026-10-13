
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://edutechpro.online")
  .trim()
  .replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_USER_KEY = "authUser";

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "USER" | "INVESTIGATOR" | "ANALYST" | "ADMIN" | string;
  status?: string;
  email_verified?: boolean;
  created_at?: string;
  last_login_at?: string | null;
  [key: string]: unknown;
};

type TokenResponse = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  user?: AuthenticatedUser;
  message?: string;
  error?: string;
};

export type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status = 0, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let refreshPromise: Promise<string | null> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getApiUrl(path: string): string {
  if (
    !path.startsWith("/api/v1/") ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    throw new Error(`Invalid FORENSIQ API path: ${path}`);
  }

  return `${API_BASE}${path}`;
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;

  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthenticatedUser | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function setAuthTokens(
  accessToken: string,
  refreshToken: string,
): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function setStoredUser(user: AuthenticatedUser): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error("FORENSIQ: Could not clear the stored session.", error);
  }
}

function redirectToLogin(): void {
  if (!isBrowser()) return;

  const currentPath = window.location.pathname;

  if (
    currentPath !== "/login" &&
    !currentPath.startsWith("/login/")
  ) {
    window.location.replace("/login");
  }
}

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
  }

  return fallback;
}

function makeApiError(
  response: Response,
  data: unknown,
): ApiError {
  return new ApiError(
    getErrorMessage(
      data,
      `API request failed with HTTP ${response.status}.`,
    ),
    response.status,
    data,
  );
}

/**
 * Public requests do not automatically attach authentication tokens.
 */
export async function publicFetch(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

/**
 * Refreshes the access token and rotates the refresh token.
 * Concurrent requests share one refresh operation.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(
        getApiUrl("/api/v1/auth/refresh"),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({ refreshToken }),
        },
      );

      const data = (await readResponseBody(
        response,
      )) as TokenResponse | null;

      if (!response.ok) {
        console.error(
          `FORENSIQ: Refresh failed with HTTP ${response.status}.`,
          getErrorMessage(data, ""),
        );

        // A 401 means the refresh token was not accepted.
        // A 400 may also mean it is invalid, depending on the backend.
        if (response.status === 401 || response.status === 400) {
          clearAuthSession();
        }

        return null;
      }

      if (
        !data ||
        typeof data.accessToken !== "string" ||
        !data.accessToken.trim() ||
        typeof data.refreshToken !== "string" ||
        !data.refreshToken.trim()
      ) {
        console.error(
          "FORENSIQ: Refresh endpoint did not return both accessToken and refreshToken.",
        );
        clearAuthSession();
        return null;
      }

      // Save BOTH tokens because the backend rotates the refresh token.
      setAuthTokens(data.accessToken, data.refreshToken);

      return data.accessToken;
    } catch (error) {
      // A temporary network/CORS failure is not proof that the
      // refresh token is invalid, so do not clear the session here.
      console.error(
        "FORENSIQ: Could not reach the refresh endpoint.",
        error,
      );

      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function sendAuthenticatedRequest(
  path: string,
  options: ApiRequestOptions,
  token: string,
): Promise<Response> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(getApiUrl(path), {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

/**
 * Sends an authenticated request.
 * If the access token is missing or the API returns 401,
 * it refreshes the token and retries the request once.
 */
export async function authFetch(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  let token = getAccessToken();

  if (!token) {
    token = await refreshAccessToken();
  }

  if (!token) {
    redirectToLogin();

    throw new ApiError(
      "Your session could not be renewed. Please log in again.",
      401,
    );
  }

  const originalToken = token;

  let response = await sendAuthenticatedRequest(
    path,
    options,
    originalToken,
  );

  if (response.status !== 401) {
    return response;
  }

  // Another request may already have refreshed the token.
  const storedToken = getAccessToken();

  let newToken: string | null;

  if (storedToken && storedToken !== originalToken) {
    newToken = storedToken;
  } else {
    newToken = await refreshAccessToken();
  }

  if (!newToken) {
    clearAuthSession();
    redirectToLogin();

    throw new ApiError(
      "Your session has expired. Please log in again.",
      401,
    );
  }

  // Retry only once to prevent an infinite refresh loop.
  response = await sendAuthenticatedRequest(
    path,
    options,
    newToken,
  );

  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();

    throw new ApiError(
      "Authentication failed after token renewal. Please log in again.",
      401,
    );
  }

  return response;
}

/**
 * Authenticated JSON helper.
 * Returns the parsed JSON response or throws ApiError.
 */
export async function authJson<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await authFetch(path, options);
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw makeApiError(response, data);
  }

  return data as T;
}

/**
 * Loads the currently authenticated user.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const data = await authJson<unknown>(
    "/api/v1/protected/user/me",
    { method: "GET" },
  );

  if (!data || typeof data !== "object") {
    throw new ApiError(
      "The current-user endpoint returned an invalid response.",
      500,
      data,
    );
  }

  const record = data as Record<string, unknown>;

  // Support either a direct user object or { user: {...} }.
  const candidate =
    record.user &&
    typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : record;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.username !== "string" ||
    typeof candidate.email !== "string"
  ) {
    throw new ApiError(
      "The current-user response is missing required user fields.",
      500,
      data,
    );
  }

  const user = candidate as unknown as AuthenticatedUser;

  setStoredUser(user);

  return user;
}

/**
 * Logs in and saves the access token, refresh token, and user.
 */
export async function login(
  identifier: string,
  password: string,
): Promise<TokenResponse & { user: AuthenticatedUser }> {
  const response = await publicFetch(
    "/api/v1/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        username: identifier,
        email: identifier,
        password,
      }),
    },
  );

  const data = (await readResponseBody(
    response,
  )) as TokenResponse | null;

  if (!response.ok) {
    throw makeApiError(response, data);
  }

  if (
    !data ||
    typeof data.accessToken !== "string" ||
    typeof data.refreshToken !== "string" ||
    !data.user
  ) {
    throw new ApiError(
      "The login response is missing accessToken, refreshToken, or user.",
      500,
      data,
    );
  }

  setAuthTokens(data.accessToken, data.refreshToken);
  setStoredUser(data.user);

  return data as TokenResponse & { user: AuthenticatedUser };
}

/**
 * Logs out on the server, then clears the local session.
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  try {
    if (refreshToken) {
      const headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      });

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      await fetch(getApiUrl("/api/v1/auth/logout"), {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    console.error(
      "FORENSIQ: Server logout request failed.",
      error,
    );
  } finally {
    clearAuthSession();

    if (isBrowser()) {
      window.location.replace("/login");
    }
  }
}
