const baseUrl = "http://localhost:5185/api";

const AUTH_SESSION_EXPIRED_EVENT = "auth:session_expired";
const REFRESH_ENDPOINT = "/Auth/refresh-token";

let refreshPromise = null;

async function request(path, options = {}) {
    return requestWithAuthRetry(path, options, baseUrl, { skipAuthRetry: false });
}

function notifySessionExpired() {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

async function requestWithAuthRetry(path, options = {}, config = {}) {
    const { skipAuthRetry = false } = config;

    try {
        return await rawRequest(path, options);
    } catch (error) {
        const isAuthRefreshEndPoint = String(path).toLowerCase() === REFRESH_ENDPOINT.toLowerCase();
        if (skipAuthRetry || isAuthRefreshEndPoint || error.status !== 401) {
            throw error;
        }

        const refreshResult = await refreshAccessToken();
        if (!refreshResult) {
            notifySessionExpired();
            throw error;
        }

        try {
            return await rawRequest(path, options);
        } catch (retryError) {
            if (retryError?.status === 401) {
                notifySessionExpired();
            }
            throw retryError;
        }
    }
}

async function rawRequest(path, options = {}) {
    const requestUrl = `${baseUrl}${path}`;
    const hasFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
        ...options.headers,
        ...(hasFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    };

    try {
        const response = await fetch(requestUrl, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('Content-Type');

        if (contentType?.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || `Request failed (${response.status})`);
                error.status = response.status;
                error.data = data;
                throw error;
            }
            return data;
        }

        const text = await response.text();

        if (!response.ok) {
            const error = new Error(text || `Request failed (${response.status})`);
            error.status = response.status;
            throw error;
        }

        return text || null;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error occurred');
        }
        throw error;
    }
}

async function authRequest(path, options = {}, config = {}) {
    return requestWithAuthRetry(path, options, undefined, config);
}

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                await authRequest(REFRESH_ENDPOINT, { method: 'POST' }, { skipAuthRetry: true });
                return true;
            } catch (error) {
                if (error?.status === 400 || error?.status === 401 || error?.status === 404) {
                    return false;
                }
                throw error;
            }
        })();
    }

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

export const authApi = {
    login: (body) => authRequest("/Auth/login", { method: 'POST', body: JSON.stringify(body) }, { skipAuthRetry: true }),

    register: (body) => authRequest("/Auth/register", { method: 'POST', body: JSON.stringify(body) }, { skipAuthRetry: true }),

    logout: () => authRequest("/Auth/logout", { method: 'POST' }),

    refresh: () => authRequest(REFRESH_ENDPOINT, { method: 'POST' }, { skipAuthRetry: true }),

    getCurrentUser: async () => {
        return authRequest('/Auth/me', {}, { skipAuthRetry: true });
    },
};

export const userApi = {
    getByEmail: (email) => request(`/v1/User/${encodeURIComponent(email)}`, { method: 'GET' }),
}