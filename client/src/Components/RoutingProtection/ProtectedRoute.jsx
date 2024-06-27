import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthUserContext';

const ProtectedRoute = ({ children }) => {
    const auth = useAuth();

    if (auth.isLoading) {
        return null;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/signup&in" />;
    }
    return children;
};

export default ProtectedRoute;