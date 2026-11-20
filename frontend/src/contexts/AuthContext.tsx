import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { login as loginService } from "../services/authService";

export type UserRole = "ADMIN" | "OPERATOR";

export interface AuthUser {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserFromToken = (token: string): AuthUser | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );

    const username = decodedPayload.sub;
    const role = decodedPayload.role;

    if (
      typeof username !== "string" ||
      (role !== "ADMIN" && role !== "OPERATOR")
    ) {
      return null;
    }

    return {
      username,
      role,
    };
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("token"),
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("token");

    return token ? getUserFromToken(token) : null;
  });

  const login = async (username: string, password: string) => {
    const token = await loginService(username, password);

    const authenticatedUser = getUserFromToken(token);

    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setUser(authenticatedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
}