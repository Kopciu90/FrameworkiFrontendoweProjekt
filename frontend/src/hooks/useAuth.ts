import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";

export const useAuth = () => {
    const [user, setUser] = useState<{ _id: string; username: string; email: string } | null>(null);
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });
            const token = data.token;
            const expirationTime = Date.now() + 3600 * 1000;
            localStorage.setItem("token", token);
            localStorage.setItem("tokenExpiration", expirationTime.toString());
            setTokenExpiry();
            await fetchMyProfile();
            navigate("/", { replace: true });
            window.location.reload();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    // Register function
    const register = async (username: string, email: string, password: string) => {
        try {
            await api.post("/auth/register", { username, email, password });
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    const fetchMyProfile = async () => {
        try {
            const { data } = await api.get("/user/profile/me", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUser(data.user);
        } catch (error) {
            console.error("Failed to fetch your profile:", error);
        }
    };

    const fetchUserByUsername = async (username: string) => {
        try {
            const { data } = await api.get(`/profile/${username}`);
            return data;
        } catch (error) {
            console.error("Failed to fetch user by username:", error);
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const setTokenExpiry = () => {
        const expirationTime = parseInt(localStorage.getItem("tokenExpiration") || "0", 10);
        if (expirationTime) {
            const remainingTime = expirationTime - Date.now();
            if (remainingTime > 0) {
                setTimeout(() => {
                    logout();
                    console.log("Token expired. User logged out.");
                }, remainingTime);
            } else {
                logout();
            }
        }
    };

    useEffect(() => {
        setTokenExpiry();
    }, []);

    return { user, login, register, logout, fetchMyProfile, fetchUserByUsername };
};
