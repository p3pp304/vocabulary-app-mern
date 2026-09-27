import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../services/apiConfig";

// Configurazione globale Axios per l'invio dei cookie
axios.defaults.baseURL = `${API_BASE_URL}/api`;
axios.defaults.withCredentials = true; // Obbligatorio per scambiare i cookie httpOnly

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Gestione visibilità modali di autenticazione
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // 1. Verifica sessione attiva al mount (lettura cookie dal server)
  const fetchUser = async () => {
    setFetchingUser(true);
    try {
      const response = await axios.get("/auth/fetchUser");
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setFetchingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 2. Registrazione
  const signup = async (username, email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/registrati", { username, email, password });
      setUser(response.data.user);
      setIsSignupOpen(false);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Errore durante la registrazione.";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/accedi", { email, password });
      setUser(response.data.user);
      setIsLoginOpen(false);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Credenziali non valide.";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Logout
  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.get("/auth/esci");
      setUser(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Errore durante il logout.";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Gestione modali
  const openLogin = () => {
    setError(null);
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const openSignup = () => {
    setError(null);
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const closeAuth = () => {
    setError(null);
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        fetchingUser,
        isLoading,
        error,
        signup,
        login,
        logout,
        clearError,
        isLoginOpen,
        isSignupOpen,
        openLogin,
        openSignup,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizzato per consumare il contesto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider");
  }
  return context;
};

export default AuthContext;