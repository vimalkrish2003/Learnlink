import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthUserContext = createContext(null);

export function useAuth() {
    return useContext(AuthUserContext);
}

export const AuthProvider = ({ children }) => {
    // Initialize isAuthenticated from localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const savedAuthState = localStorage.getItem('isAuthenticated');
        return savedAuthState === 'true'; // Convert string to boolean
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/check-auth');
                if (response.status === 200) {
                    setIsAuthenticated(true);
                    localStorage.setItem('isAuthenticated', 'true');
                } else {
                    throw new Error('Not authenticated');
                }
            } catch (err) {
                setIsAuthenticated(false);
                localStorage.setItem('isAuthenticated', 'false'); 
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <AuthUserContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading }}>
            {children}
        </AuthUserContext.Provider>
    );
}