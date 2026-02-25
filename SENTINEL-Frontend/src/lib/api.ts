
const BASE_URL = import.meta.env.VITE_API_URL as string;

function getToken(): string {
    return localStorage.getItem('sentinel_token') ?? '';
}

function authHeaders(): HeadersInit {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    };
}


let _isHandling401 = false;

function handle401(): void {

    const publicPaths = ['/login', '/signup', '/'];
    if (publicPaths.some(p => window.location.pathname === p)) return;
    if (_isHandling401) return;

    _isHandling401 = true;
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_refresh_token');

    window.dispatchEvent(new CustomEvent('sentinel-session-expired'));
}
// ────────────────────────────────────────────────────────────────────────────

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: { ...authHeaders(), ...(init.headers ?? {}) },
    });

    if (res.status === 401) {
        handle401();
        throw new Error('Session expired');
    }

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.error ?? `Request failed: ${res.status}`);
    }
    return json.data as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: 'POST',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: 'PUT',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    postNoAuth: <T>(path: string, body?: unknown) =>
        fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }).then(async (res) => {
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error ?? `${res.status}`);
            return json.data as T;
        }),
};
