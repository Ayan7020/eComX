import axios from "axios"; 

const axiosInsance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true
});

let isRefreshing = false;
let refreshSubscriber: (() => void)[] = []

const HandleLogout = () => {
    if(window.location.href !== "/login") {
        window.location.href = "/login"
    }
}

const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscriber.push(callback)
}

const onRefreshSuccess = () => {
    refreshSubscriber.forEach((callback) => callback());
    refreshSubscriber = []
}

axiosInsance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

axiosInsance.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry) {
            if(isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInsance(originalRequest)))
                }) 
            }
            originalRequest._retry = true 
            isRefreshing = true
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token-user`,{},{
                        withCredentials: true
                    }
                );
                isRefreshing = false;
                onRefreshSuccess()
                return axiosInsance(originalRequest)
            } catch (error) {
                isRefreshing = false;
                refreshSubscriber = [],
                HandleLogout();
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInsance;