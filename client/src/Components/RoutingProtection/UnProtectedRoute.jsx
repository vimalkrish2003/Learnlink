import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthUserContext';

const UnprotectedRoute = ({ children }) => {
    const auth = useAuth();

    if (auth.isLoading) {
        return null; 
    }
    
    if (auth.isAuthenticated) {
       
        return <Navigate to="/in" />;
    }
    return children;
};

export default UnprotectedRoute;