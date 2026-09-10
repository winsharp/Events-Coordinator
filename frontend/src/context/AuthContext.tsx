import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>(
    {
        isAuthenticated: false,
        login: (username: string, password: string) => { return false; },
        logout: () => {}
    }
);

interface AuthProviderProps {
    children: ReactNode;
}

function AuthProvider({children} : AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    });

    function login(username: string, password: string) : boolean {
        let storedUser = localStorage.getItem('username');
        let storedPass = localStorage.getItem('password');
        if (storedUser == username && password == storedPass) {
            sessionStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
            return true;
        }

        return false;
    }

    function logout() {
        setIsAuthenticated(false);
        sessionStorage.setItem('isAuthenticated', 'false');
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };