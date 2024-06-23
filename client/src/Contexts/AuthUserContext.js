import React,{createContext,useContext,useEffect,useState} from 'react';
import axios from 'axios';

const AuthUserContext = createContext(null);

export function useAuth()
{
    return useContext(AuthUserContext);
}


export const AuthProvider = ({children}) => {
    //const [user,setUser] = useState(null);
    const [isAuthenticated,setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/check-auth');
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            } catch (err) {
                setIsAuthenticated(false);
            }
        }
        checkAuth();
    },[]);

    return (
        <AuthUserContext.Provider value={{isAuthenticated}}>
            {children}
        </AuthUserContext.Provider>
    );
}