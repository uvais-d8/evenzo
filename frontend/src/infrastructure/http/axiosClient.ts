import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const axiosClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attach JWT token to every request
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handle token refresh and account blocking
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string }>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle blocked accounts (403)
        if (error.response?.status === 403) {
            const message = error.response.data?.message ?? '';
            if (message.toLowerCase().includes('blocked')) {
                sessionStorage.clear();
                window.location.href = '/login?error=blocked';
                return Promise.reject(error);
            }
        }

        // Handle expired access token (401) — try silent refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            sessionStorage.getItem('refreshToken')
        ) {
            if (isRefreshing) {
                // Queue the request until refresh is done
                return new Promise<string>((resolve) => {
                    subscribeTokenRefresh((token) => {
                        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosClient(originalRequest) as unknown as string);
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = sessionStorage.getItem('refreshToken');
                const { data } = await axios.post<{ token: string }>(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const newToken = data.token;
                sessionStorage.setItem('token', newToken);
                onRefreshed(newToken);

                if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch {
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
