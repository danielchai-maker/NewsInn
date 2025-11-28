import { createContext, useContext, useState, useEffect } from "react";
import { getUser, clearAuth, saveAuth } from "../authClient";

interface AuthContextType {
  user: any;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(getUser());

  const login = (data: any) => {
    saveAuth(data);
    setUser(data);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  useEffect(() => {
    setUser(getUser()); // load pas awal
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
