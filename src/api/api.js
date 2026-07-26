// const baseUrl = "http://localhost:5185/api";
// const baseUrl="http://apilibrarymanagement.runasp.net/api";
const baseUrl = "/api";

const AUTH_SESSION_EXPIRED_EVENT = "auth:session_expired";
const REFRESH_ENDPOINT = "/Auth/refresh-token";

let refreshPromise = null;

async function request(path, options = {}) {
    return requestWithAuthRetry(path, options, baseUrl, { skipAuthRetry: false });
}

function notifySessionExpired() {
    if (typeof window === 'undefined') return;

    console.log("SESSION EXPIRED");
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

async function requestWithAuthRetry(path, options = {}, config = {}) {
    const { skipAuthRetry = false } = config;

    try {
        return await rawRequest(path, options);
    } catch (error) {
        const isAuthRefreshEndPoint = String(path).toLowerCase() === REFRESH_ENDPOINT.toLowerCase();
        if (skipAuthRetry || isAuthRefreshEndPoint || error.status !== 401) {
            console.log("Request failed and will not retry:", error);
            throw error;
        }

        let refreshSucceeded = false;
        try {
            refreshSucceeded = await refreshAccessToken();
            console.log("Token refresh result:", refreshSucceeded);
        } catch (_) {
            // refresh failed unexpectedly – treat as failure
            console.error("Token refresh failed unexpectedly");
            refreshSucceeded = false;
        }

        if (!refreshSucceeded) {
            notifySessionExpired();
            console.log("Session expired, notifying and throwing error");
            throw error;   // re-throw the original request error
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
    return requestWithAuthRetry(path, options, config);
}

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                await authRequest(REFRESH_ENDPOINT, { method: 'POST' }, { skipAuthRetry: true });
                return true;
            } catch (error) {

                return false;
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
    login: (body) =>
        authRequest("/Auth/login", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body)
        }, { skipAuthRetry: true }),

    register: (body) => authRequest("/Auth/register", { method: 'POST', body: JSON.stringify(body) }, { skipAuthRetry: true }),

    logout: () => authRequest("/Auth/logout", { method: 'GET' }),

    refresh: () => authRequest(REFRESH_ENDPOINT, { method: 'POST' }, { skipAuthRetry: true }),

    getCurrentUser: async () => {
        return authRequest('/Auth/me', { method: 'GET', credentials: 'include' }, { skipAuthRetry: true });
    },
};

export const userApi = {
    getByEmail: (email) => request(`/v1/User/${encodeURIComponent(email)}`, { method: 'GET' }),

    getStudentDetails: (studentId) => request(`/v1/User/student-details/${studentId}`, { method: 'GET' }),
}

export const bookApi = {
    getFiltered: async (filters) => {
        try {
            return await request(`/v1/Book/get-all-user?${new URLSearchParams(filters).toString()}`, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching filtered books:', error);
            throw error;
        }
    }
}

export const wishlistApi = {
    addToWishlist: (body) => request(`/v1/Wishlist/add`, { method: 'POST', body: JSON.stringify(body) }),

    removeFromWishlist: (body) => request(`/v1/Wishlist/remove`, { method: 'DELETE', body: JSON.stringify(body) }),

    getWishlist: (userId) => request(`/v1/Wishlist?userId=${userId}`, { method: 'GET' }),
}

export const bookRequestApi = {
    requestBook: (body) => request(`/v1/BookRequest`, { method: 'POST', body: JSON.stringify(body) }),

    getRequestedBooks: (userId) => request(`/v1/BookRequest?userId=${userId}`, { method: 'GET' }),

    undoBookRequest: (book) => request(`/v1/BookRequest/undo`, { method: 'POST', body: JSON.stringify(book) }),

    adminPendingRequests: (body) => request(`/v1/BookRequest/admin/pending-requests`, { method: 'POST', body: JSON.stringify(body) }),

    adminRequestHistory: (body) => request(`/v1/BookRequest/admin/request-history`, { method: 'POST', body: JSON.stringify(body) }),

    approveRequest: (requestId) =>
        request(`/v1/BookRequest/approve?requestId=${requestId}`, {
            method: 'POST',
        }),

    rejectRequest: (requestId) =>
        request(`/v1/BookRequest/reject?requestId=${requestId}`, {
            method: 'GET',
        }),

        getRequestHistory: (body) => request(`/v1/BookRequest/user-history`, { method: 'POST', body: JSON.stringify(body) }),
}

export const bookIssueApi = {
    adminGetActiveBorrowings: (body) => request(`/v1/BookIssue/admin/active`, { method: 'POST', body: JSON.stringify(body) }),

    adminGetBorrowingHistory: (body) => request(`/v1/BookIssue/admin/history`, { method: 'POST', body: JSON.stringify(body) }),

    getBorrowedBooks: (userId) => request(`/v1/Borrow?userId=${userId}`, { method: 'GET' }),

    returnBook: (body) => request(`/v1/Borrow/return`, { method: 'POST', body: JSON.stringify(body) }),

    getAllIssuedBooks: (body) => request(`/v1/BookIssue/get-all`, { method: 'POST', body: JSON.stringify(body) }),

    getActiveIssuesByUser: (body) => request(`/v1/BookIssue/user/active`, { method: 'POST', body: JSON.stringify(body) }),

    getBorrowingHistoryByUser: (body) => request(`/v1/BookIssue/user/history`, { method: 'POST', body: JSON.stringify(body) }),

    issueBook: ({ requestId, dueDate }) =>
        request(`/v1/BookIssue/issue`, {
            method: 'POST',
            body: JSON.stringify({ requestId, dueDate }),
        }),

    returnBook: (bookIssueId) =>
        request(`/v1/BookIssue/return?issueId=${bookIssueId}`, {
            method: 'PATCH',
        }),
}

export const fineApi = {
    getFinesByUser: (body) => request(`/v1/Fine/user-fines`, { method: 'POST', body: JSON.stringify(body) }),

    payFine: (fineId) => request(`/v1/Fine/pay-fine?fineId=${fineId}`, { method: 'PATCH' }),

    adminGetAllFines: (body) => request(`/v1/Fine/admin-fines`, { method: 'POST', body: JSON.stringify(body) }),
};

export const commonApi = {
    userDashboardStats: (userId) => request(`/v1/common/user-dashboard/${userId}`, { method: 'GET' }),

    adminDashboardStats: () => request(`/v1/common/admin-dashboard`, { method: 'GET' }),
}